/*
  956 - DeepPick
  -------
  by hiroya iizuka (@hiroyaiizuka) #hard #deep

  ### Question

  Implement a type DeepPick, that extends Utility types `Pick`.
  A type takes two arguments.


  For example:

  ```

  type obj = {
    name: 'hoge',
    age: 20,
    friend: {
      name: 'fuga',
      age: 30,
      family: {
        name: 'baz',
        age: 1
      }
    }
  }

  type T1 = DeepPick<obj, 'name'>   // { name : 'hoge' }
  type T2 = DeepPick<obj, 'name' | 'friend.name'>  // { name : 'hoge' } & { friend: { name: 'fuga' }}
  type T3 = DeepPick<obj, 'name' | 'friend.name' |  'friend.family.name'>  // { name : 'hoge' } &  { friend: { name: 'fuga' }} & { friend: { family: { name: 'baz' }}}

  ```

  > View on GitHub: https://tsch.js.org/956
*/


/* _____________ Your Code Here _____________ */

// https://github.com/type-challenges/type-challenges/issues/12927

type UnionToIntersection<U> = (U extends unknown ? (arg: U) => void : never) extends (arg: infer I) => void ? I : never

// 知识点1：`T[F & _TKeys]` ，交叉类型避免了类型错误
// 知识点2：unknown 和 never 在联合类型中会被忽略
// 知识点3： unknown 在交叉类型中会被忽略；never 在交叉类型中优先级最高
type DeepPickUnion<T, Key extends string, _TKeys extends keyof T = keyof T> =
  Key extends `${ infer F }.${ infer L }`
    ? { [P in F]: DeepPickUnion<T[F & _TKeys], L> }
    : Key extends _TKeys
      ? { [P in Key]: T[Key] }
      : never

type DeepPick<T, Key extends string> = UnionToIntersection<DeepPickUnion<T, Key>>

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type Obj = {
  a: number
  b: string
  c: boolean
  obj: {
    d: number
    e: string
    f: boolean
    obj2: {
      g: number
      h: string
      i: boolean
    }
  }
  obj3: {
    j: number
    k: string
    l: boolean
  }
}

type cases = [
  Expect<Equal<DeepPick<Obj, ''>, unknown>>,
  Expect<Equal<DeepPick<Obj, 'a'>, { a: number }>>,
  Expect<Equal<DeepPick<Obj, 'a' | ''>, { a: number } & unknown>>,
  Expect<Equal<DeepPick<Obj, 'a' | 'obj.e'>, { a: number } & { obj: { e: string } }>>,
  Expect<Equal<DeepPick<Obj, 'a' | 'obj.e' | 'obj.obj2.i'>, { a: number } & { obj: { e: string } } & { obj: { obj2: { i: boolean } } }>>,
]


/* _____________ Further Steps _____________ */
/*
  > Share your solutions: https://tsch.js.org/956/answer
  > View solutions: https://tsch.js.org/956/solutions
  > More Challenges: https://tsch.js.org
*/

