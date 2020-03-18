import test from 'ava';
import * as EzMsgWeb from '../src/web';
import * as EzMsgNode from '../src/node';

const EzMsg = process.env.NODE_ENV === 'test-web' ? EzMsgWeb : EzMsgNode;
const { serialize, deserialize, BType } = EzMsg;

test('basic type', t => {
  t.is(deserialize(serialize(5, BType.U8), BType.U8), 5);
  t.is(deserialize(serialize(3647, BType.U16), BType.U16), 3647);
  t.is(deserialize(serialize(4823823, BType.U32), BType.U32), 4823823);
  t.is(deserialize(serialize(67, BType.I8), BType.I8), 67);
  t.is(deserialize(serialize(2343, BType.I16), BType.I16), 2343);
  t.is(deserialize(serialize(4534544, BType.I32), BType.I32), 4534544);
  t.is(
    Math.round(
      (deserialize(serialize(134.24, BType.F32), BType.F32) as number) * 100
    ) / 100,
    134.24
  );
  t.is(
    (deserialize(
      serialize(5454243.5454523, BType.F64),
      BType.F64
    ) as number).toFixed(7),
    '5454243.5454523'
  );
  t.is(deserialize(serialize(true, BType.BOOL), BType.BOOL), true);
  t.is(
    deserialize(serialize('Lorem ipsum dolor sit amet', BType.STR), BType.STR),
    'Lorem ipsum dolor sit amet'
  );
});

test('array type', t => {
  const arr = [10, 25, 32, 1, 0, 255, 16, 33, 77, 90];

  t.deepEqual(deserialize(serialize(arr, [BType.U8]), [BType.U8]), arr);
});

test('object type', t => {
  const type = {
    id: BType.U8,
    name: BType.STR,
    age: BType.U8,
    isMarried: BType.BOOL,
    mentor: null
  };

  type.mentor = type;

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
      mentor: {
        id: 3,
        name: 'Nike',
        age: 11,
        isMarried: false,
        mentor: null
      }
    }
  };

  t.deepEqual(deserialize(serialize(obj, type), type), obj);
});

test('combined type', t => {
  const type = {
    id: BType.U8,
    name: BType.STR,
    age: BType.U8,
    isMarried: BType.BOOL,
    mentor: null,
    students: null
  };

  type.mentor = type;
  type.students = [type];

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

  t.deepEqual(deserialize(serialize(obj, type), type), obj);
});
