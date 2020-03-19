export enum BType {
  U8 = 0,
  U16,
  U32,
  I8,
  I16,
  I32,
  F32,
  F64,
  BOOL,
  STR
}

export type BValue = number | boolean | string;

export type BValueParam = BValue | BValueArray | BValueObject;
export type BValueArray = BValueParam[];
export interface BValueObject {
  [x: string]: BValueParam;
}

export type BTypeParam = BType | BTypeArray | BTypeObject;
export type BTypeArray = BTypeParam[];
export interface BTypeObject {
  [x: string]: BTypeParam;
}

export interface BBufferInterface {
  write: (type: BType, offset: number, value: BValue) => number;
  writeSize: (offset: number, size: number) => number;
  read: (type: BType, offset: number) => [BValue, number];
  readSize: (offset) => [number, number];
  toArrayBuffer: () => ArrayBuffer;
  expand: (neededSize: number) => void;
}

export type CreateNewBufferFunc = (size: number) => BBufferInterface;

export type CreateBufferFromFunc = (
  arrayBuffer: ArrayBuffer
) => BBufferInterface;

export type SerializeFunc = (
  value: BValueParam,
  type: BTypeParam
) => ArrayBuffer;

export type DeserializeFunc = (
  arrayBuffer: ArrayBuffer,
  type: BTypeParam
) => BValueParam;

export type CreateSerializerFunc = (
  createNewBuffer: CreateNewBufferFunc
) => SerializeFunc;

export type CreateDeserializerFunc = (
  createBufferFrom: CreateBufferFromFunc
) => DeserializeFunc;
