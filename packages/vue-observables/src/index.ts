import {
  type Ref,
  ref,
  type ComputedRef,
  computed as vueComputed,
  type ComputedGetter,
  type WritableComputedOptions,
  type DebuggerOptions,
  type WritableComputedRef,
  type ComputedSetter
} from 'vue'
import type { RefLike } from './proxy'
import { getProxy, COMPUTED, OBSERVABLE } from './proxy'
import { ReactiveFlags } from './constants'

export interface Subscribable<T> {
  (): T
  subscribe(callback: (newValue: T) => void): () => void
  peek(): T
  getDependenciesCount(): number
}
export type Writable<T> = (value: T) => void

export interface Observable<T> extends Subscribable<T>, Writable<T>, Ref<T> {}
export interface ObservableArray<T> extends Observable<T[]> {}
export interface Computed<T> extends Subscribable<T>, ComputedRef<T> {}
export interface WritableComputed<T> extends Subscribable<T>, Writable<T>, WritableComputedRef<T> {}

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

/**
 * This is similar to observable, except, like Knockout, an empty
 * value defaults to an empty array.
 */
export function observableArray<T>(value: T[] = []): ObservableArray<T> {
  const vueObj = ref<T[]>(value) as RefLike<T[]>

  return getProxy(vueObj) as ObservableArray<T>
}

interface WritableKnockoutOptions<T> {
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

type WriteableOptions<T> = WritableKnockoutOptions<T> | WritableComputedOptions<T>

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
    }, debugOptions), true) as WritableComputed<T>
    : getProxy<T>(vueComputed(get, debugOptions), true) as Computed<T>
}

export function isObservable(obj: any): obj is Observable<any> {
  return obj && OBSERVABLE in obj
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
