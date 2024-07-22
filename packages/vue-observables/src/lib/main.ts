import {
  shallowRef,
  computed as vueComputed,
  type ComputedGetter,
  type WritableComputedOptions,
  type DebuggerOptions,
  type ComputedSetter,
  type Ref,
  type ComputedRef,
  type WritableComputedRef
} from 'vue'
import type { RefLike } from './proxy'
// import type { ExtendFunction } from './extend'
import { getProxy, COMPUTED, OBSERVABLE, READONLY } from './proxy'

const { isArray } = Array

export interface Subscribable<T> {
  (): T
  value: T
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

export type Observable<T> = Subscribable<T> & Writable<T> & Ref<T>
export type ObservableArray<T> = Observable<T[]> & Ref<T[]>
export type Computed<T> = Subscribable<T> & ComputedRef<T>
export type WritableComputed<T> = Subscribable<T> & Writable<T> & WritableComputedRef<T>

function createObservable<T>(value: T, empty?: boolean, shallow?: boolean): Observable<T> | Observable<T | undefined> {
  const vueObj: RefLike<T> = shallowRef<T>() as RefLike<T>
  const proxy = getProxy<T>(vueObj, { shallow }) as Observable<T>
  if (empty) {
    return proxy as Observable<T | undefined>
  }
  proxy.silentSet(value)
  return proxy
}

export function observable<T>(): Observable<T | undefined>
export function observable<T>(value: T): Observable<T>
export function observable<T>(value?: T) {
  return createObservable(value, arguments.length === 0)
}

// export function shallowObservable<T>(): Observable<T | undefined>
// export function shallowObservable<T>(value: T): Observable<T>
// export function shallowObservable<T>(value?: T) {
//   return createObservable(value, arguments.length === 0, true)
// }

/**
 * This is basically a convenience function for the Knockout API.
 * It's the same as an observable except defaults to an empty array.
 */
export function observableArray<T>(value: T[] = []): ObservableArray<T> {
  return createObservable(value) as ObservableArray<T>
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
    return getProxy<T>(com, { computed: true }) as Computed<T>
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
    }, debugOptions), { computed: true, writeable: true }) as WritableComputed<T>
    : getProxy<T>(vueComputed(get, debugOptions), { computed: true }) as Computed<T>
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
