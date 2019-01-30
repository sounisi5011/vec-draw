# @sounisi5011/vec-draw

SVGを書きやすくするDSL

## 構文

こういうの書きたい。

```
-- 定数の定義。再代入は禁止。
const thirdPart (100 / 3)

-- 要素や値にはidを割り当てられる。idは #ref 型で参照できる。idは、SVGにも追加される。
rect#gold

  -- 要素の属性は attr=value の形式で指定する。
  -- 属性など、要素に含まれるものはインデントして記述する。
  x=0
  y=0

  -- 変数を参照する。
  width=thirdPart
  height=thirdPart

  -- 文字列値は引用符で囲む。アポストロフィーを使用可能にするかどうかは検討中。
  fill="gold"

  -- clip-path属性には #ref 型の値を指定することができる。文字列も可。
  clip-path=#gold-clip

-- clipPath要素は自動でdefs要素内へ移動される。defs要素は、親要素内の先頭に移動される。
clipPath#gold-clip

  rect
    -- 参照した要素の属性は、専用関数とパイプライン演算子で取得する。
    -- 演算子を組み合わせた値を指定する場合は、丸括弧で囲む必要がある。
    x=(#gold |> x)
    y=(#gold |> y)

    -- 独自の属性には接頭辞"@"をつける。ただし、これは任意。
    -- rectの@size属性は、width属性とheight属性をサイズ型（後述）で指定することができる。
    @size=(#gold |> size)

    -- 逆のclip-path属性。この要素との差分が自動生成され、それがclip-path属性値に指定される。
    -- clipPath要素内でclip-path属性を指定された要素は、切り抜かれたpath要素に自動変換される。
    @inverse-clip-path=#gold-clip-circle

-- 実体が参照されていないclipPath要素は生成されない。
-- @inverse-clip-path属性で参照されているこの要素も消える。
-- Note: この挙動は変更する可能性がある。clipPath要素のみを定義したSVGを生成する需要もあるかもしれない。
clipPath#gold-clip-circle
  circle
    cx=thirdPart
    cy=thirdPart
    r=thirdPart

rect#center-rect
  -- 内容に値を直接指定することもできる。これは、数値2つをカンマでつないだ式の座標型。
  -- rectの場合、座標型の値を2つ持つ場合は、対角線上の角を指定したとして処理される。
  -- 属性と被った場合は、rectの場合、属性の値が優先される。
  (thirdPart * 1, 0)
  (thirdPart * 2, 100)

  -- color型の引数に指定された #ref 型は、参照として処理されない。単なるHexカラーコードとして読み取られる。
  -- Note: #ref 型はあくまで値の一つであり、参照先が存在しなくても構文エラーではない。
  --       参照先の取得は関数の役割であり、#ref 型を単なる文字列として扱うのも関数の自由。
  fill=color(#3c3c3c)

circle#red_circle
  -- 参照した要素の値から四則演算を行う例の一つ。
  r=(#center-rect |> width / 2)

  -- 自分自身の参照を元に演算することも可能
  -- もし可能であれば、循環参照はコンパイル時に検知される
  cx=(100 - #red_circle |> width  / 2)
  cy=(0   + #red_circle |> height / 2)

  fill="red"

rect#silver
  -- 定数はスコープ毎に定義できる。スコープが異なる場合は、名前が被っても良い。
  const thirdPart (100 / 3)

  -- 数値を x でつないだ式はサイズ型として判定される。
  -- 座標型とサイズ型の値を持つrectは、それぞれが左上の座標と四角形の大きさとして処理される。
  (thirdPart x thirdPart)
  (thirdPart * 2, thirdPart * 2)

  fill="silver"
  @inverse-clip-path=#silver-clip-circle

clipPath#silver-clip-circle
  circle
    -- パイプライン演算子はあくまで関数呼び出しでしかない。
    -- 要素の左端のx座標を取得するleft関数や、上端のy座標を取得するtop関数があっても良い。
    -- Note: 呼び出し側の座標空間から見た左端や上端を取得したい場合、関数には何かしらの形で現在の座標空間を渡す必要がある。
    --       #ref 型から参照先の座標空間を取得できるようにする…？
    cx=(#silver |> left)
    cy=(#silver |> top)
    r=(#silver |> width)

-- 任意のXMLを含めることが可能。それらはそのまま出力結果に挿入される。
-- SVGに含めたいコメントがある場合は、XMLの形式で指定する。
-- TODO: インデントの修正を行うかどうかは検討中。
<!-- このSVGは @sounisi5011/vec-draw で生成されました😊 -->

-- 定数の定義文も要素と同じ構文。なので、同じように書ける。
const
  hoge
  42
```

そしてこれがこうなる。

```svg
<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
  <defs>
    <clipPath id="gold-clip">
      <!--
      <rect x="0"
            y="0"
            width="33.33333333333333333333"
            height="33.33333333333333333333"
            clip-path="url(#vec-draw:inverse-clip-path:gold-clip-circle)"/>
      -->
      <path d="M 0 0
               H 33.33333333333333333333
               A 33.33333333333333333333 33.33333333333333333333
                 0
                 0 0
                 0 33.33333333333333333333
               Z"/>
    </clipPath>
    <!--
    <clipPath id="gold-clip-circle">
      <circle cx="33.33333333333333333333"
              cy="33.33333333333333333333"
              r="33.33333333333333333333"/>
    </clipPath>
    -->
    <!--
    <clipPath id="silver-clip-circle">
      <circle cx="66.66666666666666666666"
              cy="66.66666666666666666666"
              r="33.33333333333333333333"/>
    </clipPath>
    -->
    <clipPath id="vec-draw:inverse-clip-path:silver-clip-circle">
      <path d="M 100 66.66666666666666666666
               V 100
               H 66.66666666666666666666
               A 33.33333333333333333333 33.33333333333333333333
                 0
                 0 0
                 100 66.66666666666666666666
               Z"/>
    </clipPath>
  </defs>
  <rect id="gold"
        x="0"
        y="0"
        width="33.33333333333333333333"
        height="33.33333333333333333333"
        fill="gold"
        clip-path="url(#gold-clip)"/>
  <rect id="center-rect"
        x="33.33333333333333333333"
        y="0"
        width="33.33333333333333333333"
        height="100"
        fill="#3c3c3c"/>
  <circle id="red_circle"
          cx="83.33333333333333333333"
          cy="16.66666666666666666666"
          r="16.66666666666666666666"
          fill="red"/>
  <rect id="silver"
        x="66.66666666666666666666"
        y="66.66666666666666666666"
        width="33.33333333333333333333"
        height="33.33333333333333333333"
        fill="silver"
        clip-path="url(#vec-draw:inverse-clip-path:silver-clip-circle)"/>
  <!-- このSVGは @sounisi5011/vec-draw で生成されました&#x1F60A; -->
</svg>
```

## 機能

こんな機能があればいいな。

* ネストしたクリップパス

    どこまでネストしても適切に処理される。

* 逆のクリップパス

    `path`要素が自動生成され、それが`clip-path`属性に指定される。

* 高度な枠線の定義

    任意の場所での太さの変化はMUST。それだけでなく、ケモノのモフっとした表面みたいなギザギザも表現できるようにする。

* メッシュグラデーション

    ラスター画像の埋め込みの形で生成される。

* 読みやすく簡潔なSVG出力

    可能であれば`path`要素を用いない。また、図形は自動で結合しない。インデントの挿入は標準。長い属性定義も改行する。

* 拡張機能の追加

    `import`文みたいなもので、他のDSLファイルやマクロ、関数も読み込めるようにする。独自の言語（例えばECMAScriptなど）で記述した機能も追加できる。
