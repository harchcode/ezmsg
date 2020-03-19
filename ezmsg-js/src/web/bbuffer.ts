import {
  BBufferInterface,
  BType,
  BValue,
  CreateNewBufferFunc,
  CreateBufferFromFunc
} from '../shared/types';
import {
  BSIZE,
  BITS_PER_BYTE,
  SIZE_COUNT_BIT,
  BYTE_1_WITH_SIZE_LIMIT,
  BYTE_2_WITH_SIZE_LIMIT,
  BYTE_1_WITH_SIZE_REST,
  BYTE_2_WITH_SIZE_REST,
  BYTE_4_WITH_SIZE_REST
} from '../shared/constants';
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

  writeSize(offset: number, size: number): number {
    if (size < BYTE_1_WITH_SIZE_LIMIT) {
      const writeVal = (1 << BYTE_1_WITH_SIZE_REST) | size;
      return this.write(BType.U8, offset, writeVal);
    }

    if (size < BYTE_2_WITH_SIZE_LIMIT) {
      const writeVal = (2 << BYTE_2_WITH_SIZE_REST) | size;
      return this.write(BType.U16, offset, writeVal);
    }

    const writeVal = (4 << BYTE_4_WITH_SIZE_REST) | size;
    return this.write(BType.U32, offset, writeVal);
  }

  readSize(offset): [number, number] {
    const [firstByteValue] = this.read(BType.U8, offset);
    const byteSize = (firstByteValue as number) >> BYTE_1_WITH_SIZE_REST;

    const type =
      byteSize === 1 ? BType.U8 : byteSize === 2 ? BType.U16 : BType.U32;

    const [readVal, size] = this.read(type, offset);
    const value =
      (readVal as number) &
      ((1 << (byteSize * BITS_PER_BYTE - SIZE_COUNT_BIT)) - 1);

    return [value, size];
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
      const typeSize = this.writeSize(offset, valueSize);

      this.expand(offset + valueSize + typeSize);
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
      const [valueSize, typeSize] = this.readSize(offset);
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
