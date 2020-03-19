import { BBufferInterface, BType } from './types';
import {
  BITS_PER_BYTE,
  SIZE_COUNT_BIT,
  BYTE_1_WITH_SIZE_LIMIT,
  BYTE_2_WITH_SIZE_LIMIT,
  BYTE_1_WITH_SIZE_REST,
  BYTE_2_WITH_SIZE_REST,
  BYTE_4_WITH_SIZE_REST
} from '../shared/constants';

export function nextPowerOf2(value: number): number {
  if (value <= 0) return 1;

  let result = value;

  result--;
  result |= result >> 1;
  result |= result >> 2;
  result |= result >> 4;
  result |= result >> 8;
  result |= result >> 16;
  result++;

  return result;
}

export function writeSize(
  bBuffer: BBufferInterface,
  offset: number,
  size: number
): number {
  if (size < BYTE_1_WITH_SIZE_LIMIT) {
    const writeVal = (1 << BYTE_1_WITH_SIZE_REST) | size;
    return bBuffer.write(BType.U8, offset, writeVal);
  }

  if (size < BYTE_2_WITH_SIZE_LIMIT) {
    const writeVal = (2 << BYTE_2_WITH_SIZE_REST) | size;
    return bBuffer.write(BType.U16, offset, writeVal);
  }

  const writeVal = (4 << BYTE_4_WITH_SIZE_REST) | size;
  return bBuffer.write(BType.U32, offset, writeVal);
}

export function readSize(
  bBuffer: BBufferInterface,
  offset: number
): [number, number] {
  const [firstByteValue] = bBuffer.read(BType.U8, offset);
  const byteSize = (firstByteValue as number) >> BYTE_1_WITH_SIZE_REST;

  const type =
    byteSize === 1 ? BType.U8 : byteSize === 2 ? BType.U16 : BType.U32;

  const [readVal, size] = bBuffer.read(type, offset);
  const value =
    (readVal as number) &
    ((1 << (byteSize * BITS_PER_BYTE - SIZE_COUNT_BIT)) - 1);

  return [value, size];
}
