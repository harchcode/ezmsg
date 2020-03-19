import {
  BBufferInterface,
  BType,
  BValue,
  CreateNewBufferFunc,
  CreateBufferFromFunc
} from '../shared/types';
import { STR_SIZE_TYPE, BSIZE } from '../shared/constants';
import { nextPowerOf2 } from '../shared/utils';

const BFuncKey = [
  'Uint8',
  'Uint16',
  'Uint32',
  'Int8',
  'Int16',
  'Int32',
  'Float32',
  'Float64',
  'Uint8'
];

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export class BBuffer implements BBufferInterface {
  private arr: Uint8Array;
  private dv: DataView;

  private constructor(arrayBuffer: ArrayBuffer) {
    this.arr = new Uint8Array(arrayBuffer);
    this.dv = new DataView(arrayBuffer);
  }

  static create: CreateNewBufferFunc = (size: number) => {
    const arrayBuffer = new ArrayBuffer(size);

    return new BBuffer(arrayBuffer);
  };

  static from: CreateBufferFromFunc = (arrayBuffer: ArrayBuffer) => {
    return new BBuffer(arrayBuffer);
  };

  expand(neededSize: number) {
    const size = this.arr.byteLength;

    if (size >= neededSize) return;

    const newSize = nextPowerOf2(neededSize);
    const newBuffer = new ArrayBuffer(newSize);
    const newArr = new Uint8Array(newBuffer);
    const newDV = new DataView(newBuffer);

    newArr.set(this.arr, 0);

    this.arr = newArr;
    this.dv = newDV;
  }

  write(type: BType, offset: number, value: BValue): number {
    if (type >= BType.U8 && type <= BType.F64) {
      this.expand(offset + BSIZE[type]);
      this.dv[`set${BFuncKey[type]}`](offset, value as number);

      return BSIZE[type];
    } else if (type === BType.BOOL) {
      this.expand(offset + BSIZE[type]);
      this.dv[`set${BFuncKey[type]}`](offset, value ? 1 : 0);

      return BSIZE[type];
    } else if (type === BType.STR) {
      const encoded = encoder.encode(value as string);
      const valueSize = encoded.byteLength;
      const typeSize = BSIZE[STR_SIZE_TYPE];

      this.expand(offset + valueSize + typeSize);
      this.write(STR_SIZE_TYPE, offset, valueSize);
      this.arr.set(encoded, offset + typeSize);

      return typeSize + valueSize;
    }
  }

  read(type: BType, offset: number): [BValue, number] {
    if (type >= BType.U8 && type <= BType.F64) {
      return [this.dv[`get${BFuncKey[type]}`](offset), BSIZE[type]];
    } else if (type === BType.BOOL) {
      return [this.dv[`get${BFuncKey[type]}`](offset) > 0, BSIZE[type]];
    } else if (type === BType.STR) {
      const [valueSize, typeSize] = this.read(STR_SIZE_TYPE, offset);
      const dataOffset = offset + typeSize;

      const result = decoder.decode(
        this.arr.slice(dataOffset, dataOffset + (valueSize as number))
      );

      return [result, typeSize + (valueSize as number)];
    }
  }

  toArrayBuffer(): ArrayBuffer {
    return this.arr.buffer;
  }
}
