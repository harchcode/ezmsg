import { BBuffer } from './bbuffer';
import { createDeserializer } from '../shared/create-deserializer';
import { createSerializer } from '../shared/create-serializer';

export const serialize = createSerializer(BBuffer.create);
export const deserialize = createDeserializer(BBuffer.from);
