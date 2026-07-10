# BMP

BMP decoding for Node.js, using [Libnsbmp][Libnsbmp] compiled to [WebAssembly][WebAssembly].

[Libnsbmp]: https://www.netsurf-browser.org/projects/libnsbmp/
[WebAssembly]: https://webassembly.org

## Installation

```sh
npm install --save @cwasm/nsbmp
```

## Usage

```js
const fs = require('fs')
const nsbmp = require('@cwasm/nsbmp')

const source = fs.readFileSync('image.bmp')
const image = nsbmp.decode(source)

console.log(image)
// { width: 128,
//   height: 128,
//   data:
//    Uint8ClampedArray [ ... ] }
```

## API

### `decode(source)`

- `source` ([`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array), required) - The BMP data
- returns [`ImageData`](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) - Decoded width, height and pixel data
