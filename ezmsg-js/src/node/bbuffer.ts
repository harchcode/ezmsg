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
  'UInt8',
  'UInt16BE',
  'UInt32BE',
  'Int8',
  'Int16BE',
  'Int32BE',
  'FloatBE',
  'DoubleBE',
  'UInt8'
];

export class BBuffer implements BBufferInterface {
  private buffer: Buffer;

  private constructor() {
    // noop
  }

  static create: CreateNewBufferFunc = (size: number) => {
    const result = new BBuffer();
    result.buffer = Buffer.allocUnsafe(size);

    return result;
  };

  static from: CreateBufferFromFunc = (arrayBuffer: ArrayBuffer) => {
    const result = new BBuffer();
    result.buffer = Buffer.from(arrayBuffer);

    return result;
  };

  expand(neededSize: number) {
    const size = this.buffer.byteLength;

    if (size >= neededSize) return;

    const newSize = nextPowerOf2(neededSize);
    const newBuffer = Buffer.allocUnsafe(newSize);

    newBuffer.fill(this.buffer, 0);

    this.buffer = newBuffer;
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
      this.buffer[`write${BFuncKey[type]}`](value as number, offset);

      return BSIZE[type];
    } else if (type === BType.BOOL) {
      this.expand(offset + BSIZE[type]);
      this.buffer[`write${BFuncKey[type]}`](value ? 1 : 0, offset);

      return BSIZE[type];
    } else if (type === BType.STR) {
      const valueSize = Buffer.byteLength(value as string);
      const typeSize = this.writeSize(offset, valueSize);

      this.expand(offset + valueSize + typeSize);

      this.buffer.fill(
        value as string,
        offset + typeSize,
        offset + typeSize + valueSize,
        'utf-8'
      );

      return typeSize + valueSize;
    }
  }

  read(type: BType, offset: number): [BValue, number] {
    if (type >= BType.U8 && type <= BType.F64) {
      return [this.buffer[`read${BFuncKey[type]}`](offset), BSIZE[type]];
    } else if (type === BType.BOOL) {
      return [this.buffer[`read${BFuncKey[type]}`](offset) > 0, BSIZE[type]];
    } else if (type === BType.STR) {
      const [valueSize, typeSize] = this.readSize(offset);
      const dataOffset = offset + typeSize;

      return [
        this.buffer.toString(
          'utf-8',
          dataOffset,
          dataOffset + (valueSize as number)
        ),
        typeSize + (valueSize as number)
      ];
    }
  }

  toArrayBuffer(): ArrayBuffer {
    return this.buffer;
  }
}
