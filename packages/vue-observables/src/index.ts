import {
  shallowRef,
  shallowReactive,
  type ComputedRef,
  type ShallowRef,
  computed as vueComputed,
  type ComputedGetter,
  type WritableComputedOptions,
  type DebuggerOptions,
  type WritableComputedRef,
  type ComputedSetter
} from 'vue'
import type { RefLike } from './proxy'
import { getProxy, COMPUTED, OBSERVABLE } from './proxy'
import { ReactiveFlags, EXTENDERS_KEY } from './constants'

export { EXTENDERS_KEY }

const { isArray } = Array

export interface Subscribable<T> {
  (): T
  dispose(): void
  subscribe(callback: (newValue: T) => void): () => void
  peek(): T
  getDependenciesCount(): number
}

export interface ExtendedArray<T> extends Array<T> {
  /** @todo - allow params */
  removeAll(): void
  remove(item: T): T[]
  remove(removeFunction: (item: T) => boolean): T[]
}

export type Writable<T> = {
  (value: T): void
  silentSet(value: T): void
} & (
  T extends Array<infer I>
    ? ExtendedArray<I> : unknown)

export type Observable<T> = Subscribable<T> & Writable<T> & ShallowRef<T>
export type ObservableArray<T> = Observable<T[]>
export type Computed<T> = Subscribable<T> & ComputedRef<T>
export type WritableComputed<T> = Subscribable<T> & Writable<T> & WritableComputedRef<T>

export type SubscribableFn<T extends ((...args: any[]) => any) = ((...args: any[]) => any)> =
  T & {
    [EXTENDERS_KEY]: Array<Record<string, any>>
  }

const wrapSubscribable = <T extends (...args: any[]) => any>(
  sub: T
) => {
  (sub as any)[EXTENDERS_KEY] = []
  return sub as SubscribableFn<T>
}

function observable<T>(): Observable<T | undefined>
function observable<T>(value: T): Observable<T>
function observable<T>(value?: T) {
  if (arguments.length === 0) {
    const vueObj = shallowRef<T | undefined>() as RefLike<T>
    return getProxy<T>(vueObj, observableWrapper) as Observable<T | undefined>
  }
  value = typeof value === 'object' && value !== null ? shallowReactive(value) : value
  const vueObj = shallowRef<T>(value as T) as RefLike<T>
  return getProxy<T>(vueObj, observableWrapper) as Observable<T>
}

const observableWrapper = wrapSubscribable(observable)
export { observableWrapper as observable }

/**
 * This is similar to observable, except, like Knockout, an empty
 * value defaults to an empty array.
 */
function observableArray<T>(value: T[] = []): ObservableArray<T> {
  const vueObj = shallowRef<T[]>(shallowReactive(value)) as RefLike<T[]>

  return getProxy(vueObj, observableArrayWrapper) as ObservableArray<T>
}

const observableArrayWrapper = wrapSubscribable(observableArray)
export { observableArrayWrapper as observableArray }

export interface WritableKnockoutOptions<T> {
  read: ComputedGetter<T>
  write?: ComputedSetter<T>
  owner?: any
  // not supported, does nothing
  pure?: boolean
  // not supported, does nothing
  deferEvaluation?: boolean
  // not supported, does nothing
  disposeWhen?: () => any
  // not supported, does nothing
  disposeWhenNodeIsRemoved?: any
}

export type WriteableOptions<T> = WritableKnockoutOptions<T> | WritableComputedOptions<T>

function computed<T>(getter: ComputedGetter<T>, debugOptions?: DebuggerOptions): Computed<T>
function computed<T>(options: WriteableOptions<T>, debugOptions?: DebuggerOptions): WritableComputed<T>
function computed<T>(options: ComputedGetter<T> | WriteableOptions<T>, debugOptions?: DebuggerOptions): Computed<T> | WritableComputed<T> {
  // let com: ComputedRef<T> | WritableComputedRef<T>
  if (typeof options === 'function') {
    const com = vueComputed(options, debugOptions) as RefLike<T>
    return getProxy<T>(com, computedWrapper, true) as Computed<T>
  }
  let get = 'read' in options ? options.read : options.get
  if ('owner' in options) {
    get = get.bind(options.owner)
  }
  let set = 'write' in options ? options.write : ('set' in options ? options.set : undefined)
  if (set && 'owner' in options) {
    set = set.bind(options.owner)
  }

  return set
    ? getProxy<T>(vueComputed({
      get,
      set
    }, debugOptions), computedWrapper, true) as WritableComputed<T>
    : getProxy<T>(vueComputed(get, debugOptions), computedWrapper, true) as Computed<T>
}

const computedWrapper = wrapSubscribable(computed)
export { computedWrapper as computed }

export function isObservable(obj: unknown): obj is Observable<any> {
  return !!obj && typeof obj === 'function' && OBSERVABLE in obj
}

export function isObservableArray(obj: unknown): obj is ObservableArray<any> {
  return isObservable(obj) && isArray(obj.peek())
}

export function isWritableObservable(obj: any): obj is Observable<any> | WritableComputed<any> {
  return isObservable(obj) && !(obj as any)[ReactiveFlags.IS_READONLY]
}

export function isComputed(obj: any): obj is Computed<any> {
  return Boolean(obj?.[COMPUTED])
}

export {
  computed as pureComputed,
  isComputed as isPureComputed
}
