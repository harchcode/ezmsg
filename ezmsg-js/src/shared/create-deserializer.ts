import {
  CreateDeserializerFunc,
  CreateBufferFromFunc,
  BTypeParam,
  BBufferInterface,
  BValueParam,
  BTypeObject,
  BType,
  BTypeArray,
  BValueArray,
  BValueObject
} from './types';

function deserializeArray(
  buffer: BBufferInterface,
  type: BTypeArray,
  offset = 0
): [BValueArray, number] {
  let currentOffset = offset;

  const [size, typeSize] = buffer.readSize(currentOffset);
  currentOffset += typeSize;

  const result = [];

  for (let i = 0; i < size; i++) {
    const [value, valueSize] = deserializeValue(buffer, type[0], currentOffset);

    result.push(value);
    currentOffset += valueSize;
  }

  return [result, currentOffset - offset];
}

function deserializeObject(
  buffer: BBufferInterface,
  type: BTypeObject,
  offset = 0
): [BValueObject, number] {
  let currentOffset = offset;

  const [size, typeSize] = buffer.readSize(currentOffset);

  if (size === 0) return [null, typeSize];

  currentOffset += typeSize;

  const result = Object.create(null);

  Object.keys(type).forEach(k => {
    const [value, valueSize] = deserializeValue(buffer, type[k], currentOffset);

    result[k] = value;
    currentOffset += valueSize;
  });

  return [result, currentOffset - offset];
}

function deserializeValue(
  buffer: BBufferInterface,
  type: BTypeParam,
  offset = 0
): [BValueParam, number] {
  if (!(typeof type === 'object')) {
    return buffer.read(type as BType, offset);
  }

  if (type.constructor === Array) {
    return deserializeArray(buffer, type as BTypeArray, offset);
  }

  return deserializeObject(buffer, type as BTypeObject, offset);
}

export const createDeserializer: CreateDeserializerFunc = (
  createBufferFrom: CreateBufferFromFunc
) => {
  return (arrayBuffer: ArrayBuffer, type: BTypeParam) => {
    const buffer = createBufferFrom(arrayBuffer);

    return deserializeValue(buffer, type)[0];
  };
};
