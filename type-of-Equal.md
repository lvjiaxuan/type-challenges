#  [type-challenges/type-challenges](https://github.com/type-challenges/type-challenges) 中的 `Equal<X, Y>` 类型是如何实现类型比较的

在仓库中查看文件的 [history](https://github.com/type-challenges/type-challenges/commits/main/utils/index.d.ts)，发现有两个历史版本：
1.  [初始提交](https://github.com/type-challenges/type-challenges/blob/aa3d3ae84f366cdcebc2a3b21e13428dcb8d825c/utils/index.d.ts)
1.  [目前使用](https://github.com/type-challenges/type-challenges/blob/main/utils/index.d.ts)（after [这个提交](https://github.com/type-challenges/type-challenges/pull/16/commits/4ea665cf373f94dbc9d744df4133e266f2285ae4)）

## 自己先试一试如何实现类型比较

### 单次 extends

我一开始想的类型的比较，最简单就是使用 `a extends b`，但是很明显的 fail case 就是：

<!-- eslint-skip -->
```ts
type SingleExtends<A, B> = A extends B ? true : false
type FAIL_CASE_OF_SingleExtends = SingleExtends<1, number>
```

### 双次 extends

那使用两次 extends 吧，很遗憾，也有 fail case：

<!-- eslint-skip -->
```ts
type DoubleExtends<A, B> = A extends B ? B extends A ? true : false : false
type FAIL_CASE_OF_DoubleExtends = DoubleExtends<true, boolean> // boolean
```

> 看出这里有个知识点，`UnionType extends Type`，`UnionType` 会被逐个拆开进行计算。

### *Functional* extends

想起关于 TypeScript 中关于[协变和逆变](https://www.stephanboyer.com/post/132/what-are-covariance-and-contravariance)的概念，把要比较的类型放到箭头函数的参数中。居然还是有 fail case，哭了。

<!-- eslint-skip -->
```ts
// type FunctionExtends<A, B> = SingleExtends<(arg: A) => A, (arg: B) => B>
type FunctionExtends<A, B> = ((arg: A) => A) extends ((arg: B) => B) ? true : false

// 简直恶搞
type FAIL_CASES_OF_FunctionExtends = [
  FunctionExtends<{ readonly a: string }, { a: string }>,
  FunctionExtends<{ a: string }, { readonly a: string }>,
  FunctionExtends<any, unknown>,
  FunctionExtends<unknown, any>,
] // [true, true, true, true]
```

我知道的就这么多了，我想不出来其它了。

## 初始版本的 `Equal`

[→源码←](https://github.com/type-challenges/type-challenges/blob/aa3d3ae84f366cdcebc2a3b21e13428dcb8d825c/utils/index.d.ts)

看了下，看出了 `NOT_EQUAL_INTERNAL` 的双次 `extends`，最终还是依赖 `UnionToIntersection`。

但也没理解 `UnionToIntersection` 的意思，这里是有 fail cases 的：

```
type UnionToIntersection<U> = (U extends any ? (k: U) => void : 2) extends (k: infer I) => void ? I : 1

type case1 = UnionToIntersection<1 | 2> // I 是 never，就是不可能有这样的类型。
type case2 = UnionToIntersection<never> // unknown，冷知识：never extends 任何类型，居然都是 true 的。
```

那 `UnionToIntersection` 有 fail case 了，自然而然，这个版本的 Equal 也有 fail case 了。

## 目前使用的 `Equal`

[→源码←](https://github.com/type-challenges/type-challenges/blob/main/utils/index.d.ts)。

不知道是什么知识点，反正 [antfu](https://github.com/antfu) 就直接改这样了，提交信息也没看出要点：

<!-- eslint-skip -->
```ts
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? true : false
```

大概陈述一下：
1.  用的还是 single extends；
1.  其次被比较的类型，最妙的就是这里，`  <T>() => T extends X ? 1 : 2 `，这个表达式不会计算出结果，所以真正比较的是两个 extends 表达式（类似 Functional extends ?），估计核心就是这里了
1.  `1` 和 `2` 没有别的意思，就是凑数的，换其它都行。
