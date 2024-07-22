import {
  ref,
  shallowRef,
  shallowReactive,
  computed as vueComputed,
  type ComputedGetter,
  type WritableComputedOptions,
  type DebuggerOptions,
  type ComputedSetter
} from 'vue'
import type { RefLike } from './proxy'
// import type { ExtendFunction } from './extend'
import { getProxy, COMPUTED, OBSERVABLE, READONLY } from './proxy'

const { isArray } = Array

export interface Subscribable<T> {
  (): T
  dispose(): void
  subscribe(
    callback: (newValue: T) => void | Promise<void>,
    callbackTarget?: any,
    /** Un-used */
    event?: string
  ): () => void
  peek(): T
  getDependenciesCount(): number
}

export interface ExtendedArray<T> extends Array<T> {
  /** @todo - allow params */
  removeAll(): void
  remove(item: T): T[]
  remove(removeFunction: (item: T) => boolean): T[]
}

/** @todo `ExtendFunction` & { */
export type Writable<T> = {
  (value: T): void
  silentSet(value: T): void
} & (
  T extends Array<infer I>
    ? ExtendedArray<I> : unknown)

export type Observable<T> = Subscribable<T> & Writable<T>
export type ObservableArray<T> = Observable<T[]>
export type Computed<T> = Subscribable<T>
export type WritableComputed<T> = Subscribable<T> & Writable<T>

export function observable<T>(): Observable<T | undefined>
export function observable<T>(value: T): Observable<T>
export function observable<T>(value?: T) {
  if (arguments.length === 0) {
    const vueObj = ref<T | undefined>() as RefLike<T>
    return getProxy<T>(vueObj) as Observable<T | undefined>
  }
  const vueObj = ref<T>(value as T) as RefLike<T>
  return getProxy<T>(vueObj) as Observable<T>
}

export function shallowObservable<T>(): Observable<T | undefined>
export function shallowObservable<T>(value: T): Observable<T>
export function shallowObservable<T>(value?: T) {
  if (arguments.length === 0) {
    const vueObj = shallowRef<T | undefined>() as RefLike<T>
    return getProxy<T>(vueObj) as Observable<T | undefined>
  }
  value = typeof value === 'object' && value !== null ? shallowReactive(value) : value
  const vueObj = shallowRef<T>(value as T) as RefLike<T>
  return getProxy<T>(vueObj) as Observable<T>
}

/**
 * This is basically a convenience function for the Knockout API.
 * It's the same as an observable except defaults to an empty array.
 * Like Knockout, it's contents are always shallow-ly reactive.
 */
export function observableArray<T>(value: T[] = []): ObservableArray<T> {
  const vueObj = shallowRef<T[]>(shallowReactive(value)) as RefLike<T[]>

  return getProxy(vueObj) as ObservableArray<T>
}

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

export function computed<T>(getter: ComputedGetter<T>, debugOptions?: DebuggerOptions): Computed<T>
export function computed<T>(options: WriteableOptions<T>, debugOptions?: DebuggerOptions): WritableComputed<T>
export function computed<T>(options: ComputedGetter<T> | WriteableOptions<T>, debugOptions?: DebuggerOptions): Computed<T> | WritableComputed<T> {
  // let com: ComputedRef<T> | WritableComputedRef<T>
  if (typeof options === 'function') {
    const com = vueComputed(options, debugOptions) as RefLike<T>
    return getProxy<T>(com, true) as Computed<T>
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
    }, debugOptions), true, true) as WritableComputed<T>
    : getProxy<T>(vueComputed(get, debugOptions), true) as Computed<T>
}

export function isObservable(obj: unknown): obj is Observable<any> {
  return !!obj && typeof obj === 'function' && OBSERVABLE in obj
}

export function isObservableArray(obj: unknown): obj is ObservableArray<any> {
  return isObservable(obj) && isArray(obj.peek())
}

export function isWritableObservable(obj: any): obj is Observable<any> | WritableComputed<any> {
  return isObservable(obj) && !(obj as any)[READONLY]
}

export function isComputed(obj: any): obj is Computed<any> {
  return Boolean(obj?.[COMPUTED])
}

export {
  computed as pureComputed,
  isComputed as isPureComputed
}
