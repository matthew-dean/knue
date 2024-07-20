import type { LastArrayElement, Tagged } from 'type-fest'
import type { Subscribable, Writable } from '.'

interface FunctionSignature<T, U> {
  (value: U): unknown
  (value: U, ctx: T): unknown
}

type ExtendingFunction<T> =
  T extends Subscribable<infer U>
    ? FunctionSignature<T, U>
    : never
type ExtendPrevious<T extends (...args: any[]) => any> = ExtendingFunction<ReturnType<T>>
type Return<T extends (...args: any[]) => any> = ReturnType<T> extends Promise<infer U> ? U : ReturnType<T>
type ExtendingFunctionArray<T = any> = [ExtendingFunction<T>, ...Array<ExtendingFunction<any>>]

export type TaggedReturn<T extends (...args: any[]) => any> = Tagged<ExtendingFunctionArray, 'return', Return<T>>

/** 1 parameter */
export function extend<
  T,
  Func1 extends ExtendingFunction<T> = ExtendingFunction<T>
>(
  functions: [Func1]
): TaggedReturn<Func1>

/** 2 parameters */
export function extend<
  T,
  Func1 extends ExtendingFunction<T> = ExtendingFunction<T>,
  Func2 extends ExtendPrevious<Func1> = ExtendPrevious<Func1>
>(
  functions: [
    fn1: Func1,
    fn2: Func2
  ]
): TaggedReturn<Func2>

/** 3 parameters */
export function extend<
  T,
  Func1 extends ExtendingFunction<T> = ExtendingFunction<T>,
  Func2 extends ExtendPrevious<Func1> = ExtendPrevious<Func1>,
  Func3 extends ExtendPrevious<Func2> = ExtendPrevious<Func2>
>(
  functions: [
    fn1: Func1,
    fn2: Func2,
    fn3: Func3
  ]
): TaggedReturn<Func3>

/** 4 parameters */
export function extend<
  T,
  Func1 extends ExtendingFunction<T> = ExtendingFunction<T>,
  Func2 extends ExtendPrevious<Func1> = ExtendPrevious<Func1>,
  Func3 extends ExtendPrevious<Func2> = ExtendPrevious<Func2>,
  Func4 extends ExtendPrevious<Func3> = ExtendPrevious<Func3>
>(
  functions: [
    fn1: Func1,
    fn2: Func2,
    fn3: Func3,
    fn4: Func4
  ]
): TaggedReturn<Func4>

/** 5 parameters */
export function extend<
  T,
  Func1 extends ExtendingFunction<T> = ExtendingFunction<T>,
  Func2 extends ExtendPrevious<Func1> = ExtendPrevious<Func1>,
  Func3 extends ExtendPrevious<Func2> = ExtendPrevious<Func2>,
  Func4 extends ExtendPrevious<Func3> = ExtendPrevious<Func3>,
  Func5 extends ExtendPrevious<Func4> = ExtendPrevious<Func4>
>(
  functions: [
    fn1: Func1,
    fn2: Func2,
    fn3: Func3,
    fn4: Func4,
    fn5: Func5
  ]
): TaggedReturn<Func5>

/** 6 parameters */
export function extend<
  T,
  Func1 extends ExtendingFunction<T> = ExtendingFunction<T>,
  Func2 extends ExtendPrevious<Func1> = ExtendPrevious<Func1>,
  Func3 extends ExtendPrevious<Func2> = ExtendPrevious<Func2>,
  Func4 extends ExtendPrevious<Func3> = ExtendPrevious<Func3>,
  Func5 extends ExtendPrevious<Func4> = ExtendPrevious<Func4>,
  Func6 extends ExtendPrevious<Func5> = ExtendPrevious<Func5>
>(
  functions: [
    fn1: Func1,
    fn2: Func2,
    fn3: Func3,
    fn4: Func4,
    fn5: Func5,
    fn6: Func6
  ]
): TaggedReturn<Func6>

/** 7 parameters */
export function extend<
  T,
  Func1 extends ExtendingFunction<T> = ExtendingFunction<T>,
  Func2 extends ExtendPrevious<Func1> = ExtendPrevious<Func1>,
  Func3 extends ExtendPrevious<Func2> = ExtendPrevious<Func2>,
  Func4 extends ExtendPrevious<Func3> = ExtendPrevious<Func3>,
  Func5 extends ExtendPrevious<Func4> = ExtendPrevious<Func4>,
  Func6 extends ExtendPrevious<Func5> = ExtendPrevious<Func5>,
  Func7 extends ExtendPrevious<Func6> = ExtendPrevious<Func6>
>(
  functions: [
    fn1: Func1,
    fn2: Func2,
    fn3: Func3,
    fn4: Func4,
    fn5: Func5,
    fn6: Func6,
    fn7: Func7
  ]
): TaggedReturn<Func7>

/** 8 parameters */
export function extend<
  T,
  Func1 extends ExtendingFunction<T> = ExtendingFunction<T>,
  Func2 extends ExtendPrevious<Func1> = ExtendPrevious<Func1>,
  Func3 extends ExtendPrevious<Func2> = ExtendPrevious<Func2>,
  Func4 extends ExtendPrevious<Func3> = ExtendPrevious<Func3>,
  Func5 extends ExtendPrevious<Func4> = ExtendPrevious<Func4>,
  Func6 extends ExtendPrevious<Func5> = ExtendPrevious<Func5>,
  Func7 extends ExtendPrevious<Func6> = ExtendPrevious<Func6>,
  Func8 extends ExtendPrevious<Func7> = ExtendPrevious<Func7>
>(
  functions: [
    fn1: Func1,
    fn2: Func2,
    fn3: Func3,
    fn4: Func4,
    fn5: Func5,
    fn6: Func6,
    fn7: Func7,
    fn8: Func8
  ]
): TaggedReturn<Func8>

/** 9 parameters */
export function extend<
  T,
  Func1 extends ExtendingFunction<T> = ExtendingFunction<T>,
  Func2 extends ExtendPrevious<Func1> = ExtendPrevious<Func1>,
  Func3 extends ExtendPrevious<Func2> = ExtendPrevious<Func2>,
  Func4 extends ExtendPrevious<Func3> = ExtendPrevious<Func3>,
  Func5 extends ExtendPrevious<Func4> = ExtendPrevious<Func4>,
  Func6 extends ExtendPrevious<Func5> = ExtendPrevious<Func5>,
  Func7 extends ExtendPrevious<Func6> = ExtendPrevious<Func6>,
  Func8 extends ExtendPrevious<Func7> = ExtendPrevious<Func7>,
  Func9 extends ExtendPrevious<Func8> = ExtendPrevious<Func8>
>(
  functions: [
    fn1: Func1,
    fn2: Func2,
    fn3: Func3,
    fn4: Func4,
    fn5: Func5,
    fn6: Func6,
    fn7: Func7,
    fn8: Func8,
    fn9: Func9
  ]
): TaggedReturn<Func9>

/** More than 9 is reduced type-checking */
export function extend<
  T,
  FunctionArray extends ExtendingFunctionArray<T> = ExtendingFunctionArray<T>
>(
  this: Subscribable<any> & Writable<any>,
  functions: FunctionArray
) {
  return functions as unknown as (LastArrayElement<FunctionArray> extends ExtendingFunction<infer U> ? TaggedReturn<ExtendingFunction<U>> : never)
}

const foo = extend<Subscribable<number>>([
  (value) => { return value + 1 }
])
