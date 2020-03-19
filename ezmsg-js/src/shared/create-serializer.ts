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
  BTypeArray
} from './types';
import { INITIAL_BUFFER_SIZE } from './constants';
import { writeSize } from './utils';

function serializeArray(
  buffer: BBufferInterface,
  value: BValueArray,
  type: BTypeArray,
  offset = 0
): number {
  let currentOffset = offset;

  currentOffset += writeSize(buffer, currentOffset, value.length);

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

  const typeSize = writeSize(buffer, currentOffset, value ? keys.length : 0);

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

export const createSerializer: CreateSerializerFunc = (
  createNewBuffer: CreateNewBufferFunc
) => {
  return (value: BValueParam, type: BTypeParam) => {
    const buffer = createNewBuffer(INITIAL_BUFFER_SIZE);
    const size = serializeValue(buffer, value, type);

    return buffer.toArrayBuffer().slice(0, size);
  };
};
