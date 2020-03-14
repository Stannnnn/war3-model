"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var decodeJPEG = require("../third_party/decoder");
var blpimage_1 = require("./blpimage");
function keyword(view, offset) {
    return String.fromCharCode(view.getUint8(offset), view.getUint8(offset + 1), view.getUint8(offset + 2), view.getUint8(offset + 3));
}
function uint32(view, offset) {
    return view.getUint32(offset * 4, true);
}
function bitVal(data, bitCount, index) {
    // only 1, 4 or 8 bits
    var byte = data[Math.floor((index * bitCount) / 8)], valsPerByte = 8 / bitCount;
    return ((byte >> (valsPerByte - (index % valsPerByte) - 1)) & ((1 << bitCount) - 1));
}
// node.js have no native ImageData
function createImageData(width, height) {
    if (typeof ImageData !== "undefined") {
        return new ImageData(width, height);
    }
    else {
        return {
            width: width,
            height: height,
            data: new Uint8ClampedArray(width * height * 4)
        };
    }
}
function decode(arrayBuffer) {
    var view = new DataView(arrayBuffer);
    var image = {
        type: blpimage_1.BLPType.BLP1,
        width: 0,
        height: 0,
        content: blpimage_1.BLPContent.JPEG,
        alphaBits: 0,
        mipmaps: [],
        data: arrayBuffer
    };
    var type = keyword(view, 0);
    if (type === "BLP0" || type === "BLP2") {
        throw new Error("BLP0/BLP2 not supported");
    }
    if (type !== "BLP1") {
        throw new Error("Not a blp image");
    }
    image.content = uint32(view, 1);
    if (image.content !== blpimage_1.BLPContent.JPEG &&
        image.content !== blpimage_1.BLPContent.Direct) {
        throw new Error("Unknown BLP content");
    }
    image.alphaBits = uint32(view, 2);
    image.width = uint32(view, 3);
    image.height = uint32(view, 4);
    for (var i = 0; i < 16; ++i) {
        var mipmap = {
            offset: uint32(view, 7 + i),
            size: uint32(view, 7 + 16 + i)
        };
        if (mipmap.size > 0) {
            image.mipmaps.push(mipmap);
        }
        else {
            break;
        }
    }
    return image;
}
exports.decode = decode;
function getImageData(blp, mipmapLevel) {
    var view = new DataView(blp.data), uint8Data = new Uint8Array(blp.data), mipmap = blp.mipmaps[mipmapLevel];
    if (blp.content === blpimage_1.BLPContent.JPEG) {
        var headerSize = uint32(view, 39), data = new Uint8Array(headerSize + mipmap.size);
        data.set(uint8Data.subarray(40 * 4, 40 * 4 + headerSize));
        data.set(uint8Data.subarray(mipmap.offset, mipmap.offset + mipmap.size), headerSize);
        return decodeJPEG(data);
    }
    else {
        var palette = new Uint8Array(blp.data, 39 * 4, 256 * 4), width = blp.width / (1 << mipmapLevel), height = blp.height / (1 << mipmapLevel), size = width * height, alphaData = new Uint8Array(blp.data, mipmap.offset + size, Math.ceil((size * blp.alphaBits) / 8)), imageData = createImageData(width, height), valPerAlphaBit = 255 / ((1 << blp.alphaBits) - 1);
        for (var i = 0; i < size; ++i) {
            var paletteIndex = view.getUint8(mipmap.offset + i) * 4;
            // BGRA order
            imageData.data[i * 4] = palette[paletteIndex + 2];
            imageData.data[i * 4 + 1] = palette[paletteIndex + 1];
            imageData.data[i * 4 + 2] = palette[paletteIndex];
            if (blp.alphaBits > 0) {
                imageData.data[i * 4 + 3] =
                    bitVal(alphaData, blp.alphaBits, i) * valPerAlphaBit;
            }
            else {
                imageData.data[i * 4 + 3] = 255;
            }
        }
        return imageData;
    }
}
exports.getImageData = getImageData;
//# sourceMappingURL=decode.js.map