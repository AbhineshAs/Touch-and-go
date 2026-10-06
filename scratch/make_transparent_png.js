const fs = require('fs');
const zlib = require('zlib');

// CRC32 table for PNG chunk validation
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function removeWhiteBg(inputPath, outputPath) {
  const buf = fs.readFileSync(inputPath);
  let pos = 8;
  let width = 0, height = 0, depth = 0, colorType = 0;
  const idatChunks = [];

  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    pos += 12 + len;

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      depth = data[8];
      colorType = data[9];
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    }
  }

  const rawData = zlib.inflateSync(Buffer.concat(idatChunks));
  const bpp = colorType === 6 ? 4 : colorType === 2 ? 3 : 4;

  const outBuf = Buffer.alloc(height * (1 + width * 4));
  let inIdx = 0;
  let outIdx = 0;

  for (let y = 0; y < height; y++) {
    const filter = rawData[inIdx++];
    outBuf[outIdx++] = 0; // Filter 0 (None)

    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 255;
      if (bpp === 4) {
        r = rawData[inIdx++];
        g = rawData[inIdx++];
        b = rawData[inIdx++];
        a = rawData[inIdx++];
      } else if (bpp === 3) {
        r = rawData[inIdx++];
        g = rawData[inIdx++];
        b = rawData[inIdx++];
      }

      // If pixel is white / near white, make 100% transparent
      if (r > 225 && g > 225 && b > 225) {
        r = 0; g = 0; b = 0; a = 0;
      }

      outBuf[outIdx++] = r;
      outBuf[outIdx++] = g;
      outBuf[outIdx++] = b;
      outBuf[outIdx++] = a;
    }
  }

  const compressedIDAT = zlib.deflateSync(outBuf);

  function makeChunk(type, data) {
    const typeBuf = Buffer.from(type, 'ascii');
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);

    const crcVal = crc32(Buffer.concat([typeBuf, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crcVal, 0);

    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
  }

  const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type 6 RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', compressedIDAT);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  const finalPng = Buffer.concat([pngHeader, ihdrChunk, idatChunk, iendChunk]);
  fs.writeFileSync(outputPath, finalPng);
  console.log('Successfully created transparent PNG:', outputPath);
}

removeWhiteBg('/Users/abhineshas/projects/TAG/public/tag-logo.png', '/Users/abhineshas/projects/TAG/public/tag-logo-transparent.png');
removeWhiteBg('/Users/abhineshas/projects/TAG/public/tag-logo.png', '/Users/abhineshas/projects/TAG/public/images/tag-logo-transparent.png');
