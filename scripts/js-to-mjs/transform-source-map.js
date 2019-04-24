const stream = require('stream');

class OverrideSourceMappingURLTransform extends stream.Transform {
  constructor(callback) {
    super();
    this.chunks = [];
    this.transformCallback = callback;
  }

  _transform(chunk, encoding, callback) {
    this.chunks.push(chunk);
    callback();
  }

  _flush(callback) {
    const scriptText = this.chunks.join('');

    if (/^\/\/# sourceMappingURL=[^\r\n]+/m.test(scriptText)) {
      this.push(
        scriptText.replace(
          /^(\/\/# sourceMappingURL=)([^\r\n]+)/m,
          (_, p1, p2) => `${p1}${this.transformCallback(p2)}`,
        ),
      );
    } else {
      this.inputThrough();
    }
    callback();
  }

  inputThrough() {
    this.chunks.forEach(chunk => this.push(chunk));
  }
}

class JsonOverrideTransform extends stream.Transform {
  constructor(callback) {
    super();
    this.chunks = [];
    this.transformCallback = callback;
  }

  _transform(chunk, encoding, callback) {
    this.chunks.push(chunk);
    callback();
  }

  _flush(callback) {
    try {
      const jsonText = this.chunks.join('');
      const jsonData = JSON.parse(jsonText);
      const newData = this.transformCallback(jsonData);

      if (newData !== undefined) {
        this.push(JSON.stringify(Object.assign(jsonData, newData)));
      } else {
        this.inputThrough();
      }
    } catch (_) {
      this.inputThrough();
    }
    callback();
  }

  inputThrough() {
    this.chunks.forEach(chunk => this.push(chunk));
  }
}

class ThroughTransform extends stream.Transform {
  _transform(chunk, encoding, callback) {
    this.push(chunk);
    callback();
  }
}

module.exports = filepath => {
  if (/\.mjs\.map$/.test(filepath)) {
    return new JsonOverrideTransform(({ file }) =>
      /\.js$/.test(file) ? { file: file.replace(/\.js$/, '.mjs') } : undefined,
    );
  }

  if (/\.mjs$/.test(filepath)) {
    return new OverrideSourceMappingURLTransform(url =>
      url.replace(/\.js\.map$/, '.mjs.map'),
    );
  }

  return new ThroughTransform();
};
