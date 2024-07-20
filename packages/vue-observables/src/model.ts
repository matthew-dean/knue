/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ref, watch, computed, unref, isRef, type Ref, type UnwrapRef } from 'vue'
import type { PartialDeep, Paths, Get } from 'type-fest'
import get from 'lodash/get'
import set from 'lodash/set'
import isObject from 'lodash/isObject'
import type { ValidationError } from './validation'

export interface BaseModel<T extends Record<string, any>> {
  (): PartialDeep<T>
  <U extends Exclude<Paths<T>, number>>(path: U): {
    value: Get<T, U>
    error: string | undefined
  }
  value: PartialDeep<T>
  errors: Record<string, string>
}

type Model<T extends Record<string, any>> = BaseModel<T> & ({
  isValid: true
  validatedValue: T
} | {
  isValid: false
  validatedValue: undefined
})

type GetValueType<T> = T extends Ref<infer U> ? U : T
/**
 * Creates a model with valid / invalid state and errors
 */
export function model<
  const T extends Record<string, any>
>(
  initialValue?: PartialDeep<T> | Ref<PartialDeep<T>>,
  validator?: (value: PartialDeep<T>) => ([ValidationError, null | undefined] | [null | undefined, GetValueType<T>]) | Promise<([ValidationError, null | undefined] | [null | undefined, GetValueType<T>])>
) {
  const inObj = (
    isRef(initialValue) ? initialValue : ref(initialValue ?? {})) as Ref<PartialDeep<T>>
  const outObj = ref<GetValueType<T>>()
  const errors = ref<Record<string, string | undefined>>({})
  const error = computed(() => Object.values(errors.value)[0])
  const valid = ref(true)

  const modelGetter = function(path?: Exclude<Paths<GetValueType<T>>, number>) {
    if (arguments.length === 0) {
      return inObj.value
    }
    return {
      get value() {
        return get(inObj.value, path!)
      },
      set value(value: any) {
        set((inObj.value as PartialDeep<T>), path!, value)
      },
      get error() {
        return errors.value[path!]
      },
      get isValid() {
        return !errors.value[path!]
      }
    }
  } as Model<T>

  Object.defineProperties(modelGetter, {
    value: {
      enumerable: true,
      get: () => inObj.value,
      set: (value: any) => {
        inObj.value = value
      }
    },
    validatedValue: {
      get: () => outObj.value
    },
    isValid: {
      enumerable: true,
      get() {
        return valid.value
      },
      set(v: boolean) {
        valid.value = v
      }
    },
    errors: {
      enumerable: true,
      get() {
        return errors.value
      },
      set(v: Record<string, string>) {
        errors.value = v
      }
    },
    error: {
      get() {
        return error.value
      }
    }
  })

  if (validator) {
    watch(inObj, async () => {
      try {
        const [err, result] = await validator(inObj.value as PartialDeep<T>)
        if (err) {
          throw err
        }
        outObj.value = result
        modelGetter.isValid = true
        modelGetter.errors = {}
      } catch (err) {
        outObj.value = undefined
        modelGetter.isValid = false
        if (isObject(err)) {
          if ('errors' in err && isObject(err.errors)) {
            modelGetter.errors = err.errors as Record<string, string>
          } else if ('message' in err && typeof err.message === 'string') {
            modelGetter.errors = { UNKNOWN: err.message }
          }
        } else {
          modelGetter.errors = { UNKNOWN: 'An unknown error occurred' }
        }
      }
    }, { deep: true, immediate: true })
  }

  return modelGetter
}
