import {
  CreateSerializerFunc,
  BTypeParam,
  CreateNewBufferFunc,
  BValueParam,
  BType,
  BValueArray,
  BValueObject,
  BBufferInterface,
  BValue,
  BTypeObject,
  BTypeArray,
  CalcStrSizeFunc
} from './types';
import { BSIZE, MAX_SIZE_TYPE } from './constants';

function serializeArray(
  buffer: BBufferInterface,
  value: BValueArray,
  type: BTypeArray,
  offset = 0
): number {
  let currentOffset = offset;

  currentOffset += buffer.write(MAX_SIZE_TYPE, currentOffset, value.length);

  value.forEach(v => {
    currentOffset += serializeValue(buffer, v, type[0], currentOffset);
  });

  return currentOffset - offset;
}

function serializeObject(
  buffer: BBufferInterface,
  value: BValueObject,
  type: BTypeObject,
  offset = 0
): number {
  let currentOffset = offset;
  const keys = Object.keys(type);

  const typeSize = buffer.write(
    MAX_SIZE_TYPE,
    currentOffset,
    value ? keys.length : 0
  );

  if (!value) return typeSize;

  currentOffset += typeSize;

  keys.forEach(k => {
    currentOffset += serializeValue(buffer, value[k], type[k], currentOffset);
  });

  return currentOffset - offset;
}

function serializeValue(
  buffer: BBufferInterface,
  value: BValueParam,
  type: BTypeParam,
  offset = 0
): number {
  if (!(typeof type === 'object')) {
    return buffer.write(type as BType, offset, value as BValue);
  }

  if (type.constructor === Array) {
    return serializeArray(
      buffer,
      value as BValueArray,
      type as BTypeArray,
      offset
    );
  }

  return serializeObject(
    buffer,
    value as BValueObject,
    type as BTypeObject,
    offset
  );
}

function countBufferSize(
  value: BValueParam,
  type: BTypeParam,
  calcStrSize: CalcStrSizeFunc
) {
  if (!(typeof type === 'object')) {
    if (type !== BType.STR) return BSIZE[type as BType];

    return calcStrSize(value as string);
  }

  if (type.constructor === Array) {
    return (value as BValueArray).reduce(
      (acc, v) => acc + countBufferSize(v, type[0], calcStrSize),
      BSIZE[MAX_SIZE_TYPE]
    );
  }

  if (!value) return MAX_SIZE_TYPE;

  return Object.keys(type as BValueObject).reduce(
    (acc, k) => acc + countBufferSize(value[k], type[k], calcStrSize),
    BSIZE[MAX_SIZE_TYPE]
  );
}

export const createSerializer: CreateSerializerFunc = (
  createNewBuffer: CreateNewBufferFunc,
  calcStrSize: CalcStrSizeFunc
) => {
  return (value: BValueParam, type: BTypeParam) => {
    const bufferSize = countBufferSize(value, type, calcStrSize);

    const buffer = createNewBuffer(bufferSize);

    serializeValue(buffer, value, type);

    return buffer.toArrayBuffer();
  };
};
