/*
  13580 - Replace Union
  -------
  by Konstantin Barabanov (@crutch12) #hard

  ### Question

  Given an `union of types` and `array of type pairs` to replace (`[[string, number], [Date, null]]`), return a new union replaced with the `type pairs`.

  > View on GitHub: https://tsch.js.org/13580
*/

/* _____________ Your Code Here _____________ */

type UnionReplace<T, U extends [unknown, unknown][]> = U extends [
  infer A extends [unknown, unknown],
  ...infer B extends [unknown, unknown][],
]
  ? T extends A[0] // Union type was separated.
    ? A[1]
    : UnionReplace<T, B>
  : T


/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'
import type { ExpectFalse, NotEqual } from '@type-challenges/utils'

type cases = [
  // string -> null
  Expect<Equal<UnionReplace<number | string, [[string, null]]>, number | null>>,

  // Date -> string; Function -> undefined
  // eslint-disable-next-line max-len, @typescript-eslint/ban-types
  Expect<Equal<UnionReplace<Function | Date | object, [[Date, string], [Function, undefined]]>, undefined | string | object>>,
]

/* _____________ Further Steps _____________ */
/*
  > Share your solutions: https://tsch.js.org/13580/answer
  > View solutions: https://tsch.js.org/13580/solutions
  > More Challenges: https://tsch.js.org
*/
