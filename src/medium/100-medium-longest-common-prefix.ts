/*
  35045 - Longest Common Prefix
  -------
  by Tom Cleary (@thomcleary) #medium

  ### Question

  ### Longest Common Prefix

  Write a type, `LongestCommonPrefix` that returns the longest common prefix string amongst a tuple of strings.

  If there is no common prefix, return an empty string `""`.

  ```ts
  type Common = LongestCommonPrefix<["flower", "flow", "flight"]>
  //   ?^ "fl"

  type Uncommon = LongestCommonPrefix<["dog", "racecar", "race"]>
  //   ?^ ""
  ```
  Inspired by [LeetCode 14. Longest Common Prefix](https://leetcode.com/problems/longest-common-prefix/description/)

  > View on GitHub: https://tsch.js.org/35045
*/

/* _____________ Your Code Here _____________ */


// https://github.com/type-challenges/type-challenges/issues/35251
type LongestCommonPrefix<T extends string[], P extends string = ''> =
  T extends `${P}${infer F extends string}${string}`[]
    ? {} extends {[K in F as Exclude<F, K>]: 1} // a alternative way to check if a type is a union type.
      ? LongestCommonPrefix<T, `${P}${F}`>
      : P
    : P

// type IsUnion<T, U = T> = [T] extends [never] ? false : T extends T ? [U] extends [T] ? false : true : false
// type LongestCommonPrefix<T extends string[], P extends string = ''> =
//   T extends `${P}${infer F extends string}${string}`[]
//     ? IsUnion<F> extends false
//       ? LongestCommonPrefix<T, `${P}${F}`>
//       : P
//     : P

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<LongestCommonPrefix<['flower', 'flow', 'flight']>, 'fl'>>,
  Expect<Equal<LongestCommonPrefix<['dog', 'racecar', 'race']>, ''>>,
  Expect<Equal<LongestCommonPrefix<['', '', '']>, ''>>,
  Expect<Equal<LongestCommonPrefix<['a', '', '']>, ''>>,
  Expect<Equal<LongestCommonPrefix<['', 'a', '']>, ''>>,
  Expect<Equal<LongestCommonPrefix<['', '', 'a']>, ''>>,
  Expect<Equal<LongestCommonPrefix<['a', 'a', '']>, ''>>,
  Expect<Equal<LongestCommonPrefix<['a', '', 'a']>, ''>>,
  Expect<Equal<LongestCommonPrefix<['', 'a', 'a']>, ''>>,
  Expect<Equal<LongestCommonPrefix<['a', 'a', 'a']>, 'a'>>,
  Expect<Equal<LongestCommonPrefix<['abc', 'abcd', 'abcde']>, 'abc'>>,
  Expect<Equal<LongestCommonPrefix<[' ', ' ', ' ']>, ' '>>,
  Expect<Equal<LongestCommonPrefix<['type-challenges', 'type-hero', 'typescript']>, 'type'>>,
]

/* _____________ Further Steps _____________ */
/*
  > Share your solutions: https://tsch.js.org/35045/answer
  > View solutions: https://tsch.js.org/35045/solutions
  > More Challenges: https://tsch.js.org
*/

const createKeyboard = (modelID: any) => {
  const _defaultModelID = 23;
  // 'defaultModelID' is declared but its value is never read.
  return { type: "keyboard", modelID };
};

const createDefaultKeyboard = (_modelID: number, xx: string) => {
  // 'modelID' is declared but its value is never read.
    const defaultModelID = 23;
    return { type: "keyboard", modelID: defaultModelID };
  };