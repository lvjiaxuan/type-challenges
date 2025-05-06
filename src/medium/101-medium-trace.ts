/*
  35191 - Trace
  -------
  by csharpython (@csharpython) #medium

  ### Question

  The trace of a square matrix is the sum of the elements on its main diagonal.
  However, it's difficult to calculate the sum with type system.
  To make things simple, let's return the elements on the main diagonal with union type.


  For example:

  ```ts
  type Arr = [
    [1,2],
    [3,4]
  ]
  type Test = Trace<Arr> // expected to be 1 | 4
  ```

  1,2,3,4,5
  1,2,3,4,5
  1,2,3,4,5
  1,2,3,4,5
  1,2,3,4,5

  > View on GitHub: https://tsch.js.org/35191
*/

/* _____________ Your Code Here _____________ */

// It has recursive type declarations struggle with longer tuples.
type Trace<
  T extends (number | string)[][],
  Length extends number = T['length'],
  IndexArr extends 1[] = [],
  Index extends number = IndexArr['length'],
> = Index extends Length
  ? never
  : T[Index][Index] | Trace<T, Length, [ 1, ...IndexArr ]>

// https://github.com/type-challenges/type-challenges/issues/35247
type Trace2<T extends any[][]> = {[P in keyof T]: T[P][P & keyof T[P]]}[number]

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Trace<[[1, 2], [3, 4]]>, 1 | 4>>,
  Expect<Equal<Trace<[[0, 1, 1], [2, 0, 2], [3, 3, 0]]>, 0>>,
  Expect<Equal<Trace<[['a', 'b', ''], ['c', '', ''], ['d', 'e', 'f']]>, 'a' | '' | 'f'>>,
]

/* _____________ Further Steps _____________ */
/*
  > Share your solutions: https://tsch.js.org/35191/answer
  > View solutions: https://tsch.js.org/35191/solutions
  > More Challenges: https://tsch.js.org
*/
