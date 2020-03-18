/* eslint no-console: 0 */

import * as Benchmark from 'benchmark';
import * as EzMsgWeb from '../src/web';
import * as EzMsgNode from '../src/node';

const suite = new Benchmark.Suite();

let ezMsgWebBufferSize = 0;
let ezMsgNodeBufferSize = 0;
let jsonStringSize = 0;

const obj = {
  id: 1,
  name: 'John',
  age: 27,
  isMarried: false,
  mentor: {
    id: 2,
    name: 'Jane',
    age: 33,
    isMarried: true,
    mentor: null,
    students: []
  },
  students: [
    {
      id: 3,
      name: 'Money',
      age: 214,
      isMarried: false,
      mentor: null,
      students: []
    },
    {
      id: 4,
      name: 'George',
      age: 37,
      isMarried: true,
      mentor: null,
      students: []
    }
  ]
};

suite
  .add('EzMsg web version', () => {
    const type = {
      id: EzMsgWeb.BType.U8,
      name: EzMsgWeb.BType.STR,
      age: EzMsgWeb.BType.U8,
      isMarried: EzMsgWeb.BType.BOOL,
      mentor: null,
      students: null
    };

    type.mentor = type;
    type.students = [type];

    const buffer = EzMsgWeb.serialize(obj, type);

    if (!ezMsgWebBufferSize) ezMsgWebBufferSize = buffer.byteLength;

    EzMsgWeb.deserialize(buffer, type);
  })
  .add('EzMsg node version', () => {
    const type = {
      id: EzMsgNode.BType.U8,
      name: EzMsgNode.BType.STR,
      age: EzMsgNode.BType.U8,
      isMarried: EzMsgNode.BType.BOOL,
      mentor: null,
      students: null
    };

    type.mentor = type;
    type.students = [type];

    const buffer = EzMsgNode.serialize(obj, type);

    if (!ezMsgNodeBufferSize) ezMsgNodeBufferSize = buffer.byteLength;

    EzMsgNode.deserialize(buffer, type);
  })
  .add('JSON', () => {
    const str = JSON.stringify(obj);

    if (!jsonStringSize) jsonStringSize = Buffer.byteLength(str);

    JSON.parse(str);
  })
  .on('cycle', function(event: Benchmark.Event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
    console.log(`EzMsg Web buffer size: ${ezMsgWebBufferSize}`);
    console.log(`EzMsg Node buffer size: ${ezMsgNodeBufferSize}`);
    console.log(`JSON string size: ${jsonStringSize}`);
  })
  .run({ async: true });
