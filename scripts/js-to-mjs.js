const fs = require('fs');
const globCallback = require('glob');
const makeDir = require('make-dir');
const path = require('path');
const util = require('util');

const [glob, fsReadFile, fsWriteFile, fsRename, fsUnlink] = [
  globCallback,
  fs.readFile,
  fs.writeFile,
  fs.rename,
  fs.unlink,
].map(util.promisify);

const sourceMapURLRegExp = /((?:^|[\r\n])\/\/# sourceMappingURL=)([^\r\n]+)[\r\n]*$/;

function replaceJsPath(filepath) {
  return filepath.replace(/\.js$/, '.mjs');
}

function replaceMapPath(filepath) {
  return filepath.replace(/\.js\.map$/, '.mjs.map');
}

function substringReplace(str, replaceValue, startIndex, endIndex) {
  return str.substring(0, startIndex) + replaceValue + str.substring(endIndex);
}

function filepathRelative(currentFilepath, targetFilepath) {
  return path.join(
    path.relative(path.dirname(currentFilepath), path.dirname(targetFilepath)),
    path.basename(targetFilepath),
  );
}

function cwdRelative(callSite, ...substitutions) {
  return callSite
    .map(
      (str, index) =>
        (index > 0
          ? path.relative(process.cwd(), substitutions[index - 1])
          : '') + str,
    )
    .join('');
}

/**
 * @return {string|null}
 */
async function getFileContents(filepath) {
  try {
    return await fsReadFile(filepath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

function logOutput(line) {
  process.stderr.write(`${line.replace(/^(?!$)/gm, '  ')}\n`);
}

async function createFile(filepath, contents) {
  await makeDir(path.dirname(filepath));
  await fsWriteFile(filepath, contents);
  // logOutput(cwdRelative`create ${filepath}`);
}

async function renameFile(fromPath, toPath) {
  await makeDir(path.dirname(toPath));
  await fsRename(fromPath, toPath);
  // logOutput(cwdRelative`rename ${fromPath} ${toPath}`);
}

async function deleteFile(filepath) {
  await fsUnlink(filepath);
  // logOutput(cwdRelative`delete ${filepath}`);
}

/**
 * @return {string|null} リネーム後のパス、あるいは、失敗した場合にnull
 */
async function renameSourceMap({
  sourceMap: sourceMapFilepath,
  jsFilepath,
  srcDir: sourceDirpath,
  destDtr: destDirpath,
}) {
  const oldSourceMapFullpath = path.resolve(sourceDirpath, sourceMapFilepath);
  const sourceMapContents = await getFileContents(oldSourceMapFullpath, 'utf8');

  if (sourceMapContents !== null) {
    /*
     * SourceMapを開けた（アクセス権限のあるローカルファイルの）場合、リネームを試みる
     */
    const sourceMapData = JSON.parse(sourceMapContents);
    const newSourceMapFullpath = path.resolve(
      destDirpath,
      replaceMapPath(sourceMapFilepath),
    );

    const newJsFullpath = path.resolve(destDirpath, jsFilepath);
    const newFileField = filepathRelative(newSourceMapFullpath, newJsFullpath);

    if (newFileField !== sourceMapData.file) {
      /*
       * fileフィールドが異なる場合、内容を更新してリネームする
       */
      sourceMapData.file = newFileField;
      const newSourceMapContents = JSON.stringify(sourceMapData);
      await createFile(newSourceMapFullpath, newSourceMapContents);
      await deleteFile(oldSourceMapFullpath);
    } else {
      /*
       * fileフィールドが同じ場合、リネームのみを行う
       */
      await renameFile(oldSourceMapFullpath, newSourceMapFullpath);
    }

    return newSourceMapFullpath;
  }

  return null;
}

(async () => {
  const sourceDirFullpath = path.resolve(process.argv[2]);
  const destDirFullpath =
    process.argv.length > 3 ? path.resolve(process.argv[3]) : sourceDirFullpath;

  const tasks = (await glob('**/*.js', { cwd: sourceDirFullpath })).map(
    async jsFilepath => {
      const oldJsFullpath = path.resolve(sourceDirFullpath, jsFilepath);
      const newJsFullpath = path.resolve(
        destDirFullpath,
        replaceJsPath(jsFilepath),
      );

      const jsContents = await fsReadFile(oldJsFullpath, 'utf8');
      const match = sourceMapURLRegExp.exec(jsContents);

      if (match) {
        /*
         * SourceMapのURLが見つかった場合、
         * SourceMapファイルをリネームする
         */
        const sourceMapURL = match[2];
        const sourceMapFilepath = path.join(
          path.dirname(jsFilepath),
          sourceMapURL,
        );
        const newSourceMapFullpath = await renameSourceMap({
          sourceMap: sourceMapFilepath,
          jsFilepath: newJsFullpath,
          srcDir: sourceDirFullpath,
          destDtr: destDirFullpath,
        });

        if (newSourceMapFullpath !== null) {
          /*
           * SourceMapファイルのリネームに成功した場合、
           * スクリプトファイルに含まれるSourceMapのURLを新しい名前に置換する
           */
          const urlStartIndex = match.index + match[1].length;
          const urlEndIndex = urlStartIndex + sourceMapURL.length;
          const newJsContents = substringReplace(
            jsContents,
            filepathRelative(newJsFullpath, newSourceMapFullpath),
            urlStartIndex,
            urlEndIndex,
          );

          await createFile(newJsFullpath, newJsContents);
          await deleteFile(oldJsFullpath);
        } else {
          /*
           * SourceMapファイルのリネームが失敗した場合、
           * ファイルをただ移動する
           */
          await renameFile(oldJsFullpath, newJsFullpath);
        }
      } else {
        /*
         * SourceMapのURLが見つからなかった場合、
         * ファイルをただ移動する
         */
        await renameFile(oldJsFullpath, newJsFullpath);
      }

      logOutput(cwdRelative`${oldJsFullpath}\n→ ${newJsFullpath}\n`);
    },
  );

  try {
    await Promise.all(tasks);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.dir(error);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }
})();
