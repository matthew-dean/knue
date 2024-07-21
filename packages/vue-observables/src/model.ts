/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ref, computed, isRef, shallowRef, type Ref } from 'vue'
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
  readonly isValid: true
  validatedValue: T
} | {
  readonly isValid: false
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
  validator?: (data: unknown, path: string) => ([ValidationError, null | undefined] | [null | undefined, any]) | Promise<([ValidationError, null | undefined] | [null | undefined, any])>,
  options?: {
    /** @default false */
    validateOnMount?: boolean
  }
) {
  options ??= {}
  const inObj = (
    isRef(initialValue) ? initialValue : ref(initialValue ?? {})) as Ref<PartialDeep<T>>
  const outObj = shallowRef<GetValueType<T>>()
  const errors = ref<Record<string, string | undefined>>({})
  const error = computed(() => {
    return Object.values(errors.value)[0]
  })
  const modelValid = computed(() => Object.values(errors.value).length === 0)
  /** Create reactions for retrieved paths */
  const reactivePathMap = new Map<string, Ref<number>>()

  const processValidation = async (data: any, path: string) => {
    /** Validating the root means wiping all errors */
    if (!path) {
      errors.value = {}
    } else {
      /**
       * Wipe an error only if the key includes the path,
       * because all children keys will be re-validated as well.
       */
      for (const key of Object.keys(errors.value)) {
        if (key.startsWith(path)) {
          errors.value[key] = undefined
        }
      }
    }
    try {
      const [err, result] = await validator!(data, path)
      if (err) {
        throw err
      }
      outObj.value = result
    } catch (err) {
      outObj.value = undefined
      if (isObject(err)) {
        if ('errors' in err && isObject(err.errors)) {
          errors.value = { ...errors.value, ...err.errors }
        } else if ('message' in err && typeof err.message === 'string') {
          errors.value = { ...errors.value, UNKNOWN: err.message }
        }
      } else {
        errors.value = { ...errors.value, UNKNOWN: 'An unknown error occurred' }
      }
    }
  }

  const modelGetter = function(path?: Exclude<Paths<GetValueType<T>>, number>) {
    if (arguments.length === 0) {
      return inObj.value
    }
    return {
      get value() {
        let reaction = reactivePathMap.get(path!)
        if (!reaction) {
          reaction = ref(1)
          reactivePathMap.set(path!, reaction)
        }
        /**
         * We need to access the value of the reaction to trigger the watcher
         */
        reaction.value // eslint-disable-line @typescript-eslint/no-unused-expressions
        return get(inObj.value, path!)
      },
      set value(value: any) {
        let reaction = reactivePathMap.get(path!)
        if (!reaction) {
          reaction = ref(0)
          reactivePathMap.set(path!, reaction)
        }
        /**
         * Set the reaction value to trigger dependencies
         */
        reaction.value++
        set(inObj.value, path!, value)
        /** Trigger validation */
        if (validator) {
          void processValidation(value, path!)
        }
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
        return modelValid.value
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

  if (validator && options.validateOnMount) {
    void processValidation(inObj.value, '')
  }

  return modelGetter
}
