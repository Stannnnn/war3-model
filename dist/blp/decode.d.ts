import { BLPImage } from './blpimage';
interface ImageDataLike {
    width: number;
    height: number;
    data: Uint8ClampedArray;
}
export declare function decode(arrayBuffer: ArrayBuffer): BLPImage;
export declare function getImageData(blp: BLPImage, mipmapLevel: number): ImageDataLike;
export {};
