export declare enum BLPType {
    BLP0 = 0,
    BLP1 = 1,
    BLP2 = 2
}
export declare enum BLPContent {
    JPEG = 0,
    Direct = 1
}
export interface BLPMipMap {
    offset: number;
    size: number;
}
export interface BLPImage {
    type: BLPType;
    width: number;
    height: number;
    content: BLPContent;
    alphaBits: number;
    mipmaps: BLPMipMap[];
    data: ArrayBuffer;
}
