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
      const typeSize = BSIZE[STR_SIZE_TYPE];

      this.expand(offset + valueSize + typeSize);
      this.write(STR_SIZE_TYPE, offset, valueSize);

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
      const [valueSize, typeSize] = this.read(STR_SIZE_TYPE, offset);
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
