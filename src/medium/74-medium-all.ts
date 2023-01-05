/*
  18142 - All
  -------
  by cutefcc (@cutefcc) #medium #array

  ### Question

  Returns true if all elements of the list are equal to the second parameter passed in, false if there are any mismatches.

  For example

  ```ts
  type Test1 = [1, 1, 1]
  type Test2 = [1, 1, 2]

  type Todo = All<Test1, 1> // should be same as true
  type Todo2 = All<Test2, 1> // should be same as false
  ```

  > View on GitHub: https://tsch.js.org/18142
*/

/* _____________ Your Code Here _____________ */


/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type All<T extends unknown[], E> =
  T extends [ infer F, ...infer Rest ]
    ? Equal<F, E> extends true
      ? All<Rest, E>
      : false
    : true

type cases = [
  Expect<Equal<All<[1, 1, 1], 1>, true>>,
  Expect<Equal<All<[1, 1, 2], 1>, false>>,
  Expect<Equal<All<['1', '1', '1'], '1'>, true>>,
  Expect<Equal<All<['1', '1', '1'], 1>, false>>,
  Expect<Equal<All<[number, number, number], number>, true>>,
  Expect<Equal<All<[number, number, string], number>, false>>,
  Expect<Equal<All<[null, null, null], null>, true>>,
  Expect<Equal<All<[[1], [1], [1]], [1]>, true>>,
  // eslint-disable-next-line @typescript-eslint/ban-types
  Expect<Equal<All<[{}, {}, {}], {}>, true>>,
]

/* _____________ Further Steps _____________ */
/*
  > Share your solutions: https://tsch.js.org/18142/answer
  > View solutions: https://tsch.js.org/18142/solutions
  > More Challenges: https://tsch.js.org
*/
