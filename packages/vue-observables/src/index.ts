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
import type { RefLike, ControlledRef } from './proxy'
import { refWithControl } from '@vueuse/core'
import { getProxy } from './proxy'

export interface Subscribable<T> {
  (): T
  subscribe(callback: (newValue: T) => void): () => void
}

export interface Observable<T> extends Subscribable<T>, Ref<T> {}
export interface ObservableArray<T> extends Observable<T[]> {}
export interface Computed<T> extends Subscribable<T>, ComputedRef<T> {}

export function observable<T>(): Observable<T | undefined>
export function observable<T>(value: T): Observable<T>
export function observable<T>(value?: T) {
  if (arguments.length === 0) {
    const vueObj = refWithControl<T | undefined>(undefined)
    return getProxy(vueObj) as Observable<T | undefined>
  }
  const vueObj = refWithControl<T>(value as T)
  return getProxy(vueObj) as Observable<T>
}

/**
 * This is similar to observable, except, like Knockout, an empty
 * value defaults to an empty array.
 */
export function observableArray<T>(value: T[] = []): ObservableArray<T> {
  const vueObj = ref<T[]>(value)

  return getProxy(vueObj) as ObservableArray<T>
}

interface WritableKnockoutOptions<T> {
  read: ComputedGetter<T>
  write: ComputedSetter<T>
}

type WriteableOptions<T> = WritableKnockoutOptions<T> | WritableComputedOptions<T>

export function computed<T>(getter: ComputedGetter<T>, debugOptions?: DebuggerOptions): ComputedRef<T>
export function computed<T>(options: WriteableOptions<T>, debugOptions?: DebuggerOptions): WritableComputedRef<T>
export function computed<T>(options: ComputedGetter<T> | WriteableOptions<T>, debugOptions?: DebuggerOptions): ComputedRef<T> | WritableComputedRef<T> {
  // let com: ComputedRef<T> | WritableComputedRef<T>
  if (typeof options === 'function') {
    const com = vueComputed(options, debugOptions)
    return getProxy<T>(com, false) as ComputedRef<T>
  }
  const get = 'read' in options ? options.read : options.get
  const set = 'write' in options ? options.write : options.set
  const com = vueComputed({
    get,
    set
  }, debugOptions)
  return getProxy<T>(com, false) as WritableComputedRef<T>
}
