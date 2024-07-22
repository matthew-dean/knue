/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ref, computed, isRef, shallowRef, triggerRef, type Ref } from 'vue'
import type { PartialDeep, Paths, Get } from 'type-fest'
import get from 'lodash/get'
import set from 'lodash/set'
import isObject from 'lodash/isObject'
import merge from 'lodash/merge'
import type { ValidationError } from './validation'

export interface BaseModel<T extends Record<string, any>> {
  (): PartialDeep<T>
  <U extends Exclude<Paths<T>, number>>(path: U): {
    value: Get<T, U>
    readonly error: string | undefined
    readonly isValid: boolean
    readonly touched: boolean
    readonly bind: {
      input: () => void
      change: () => void
    }
    readonly onInput: () => void
    readonly onChange: () => void
    readonly validate: () => void
  }
  value: PartialDeep<T>
  readonly errors: Record<string, string | undefined>
  /** First error */
  readonly error: string | undefined
  readonly touched: boolean
  readonly isValid: boolean
  readonly validatedValue: T | undefined
  readonly validate: () => void
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
  options?: {
    /** Creates an initial structure */
    initializer?: () => PartialDeep<T>
    /** Validates paths when they change */
    validator?: (data: unknown, path: string) => ([ValidationError, null | undefined] | [null | undefined, any]) | Promise<([ValidationError, null | undefined] | [null | undefined, any])>
    /** @default false */
    validateOnMount?: boolean
  }
) {
  options ??= {}
  const { validator, initializer } = options
  const inObj = (
    isRef(initialValue)
      ? initialValue
      : shallowRef(initialValue)
  ) as Ref<PartialDeep<T>>

  /** Create starting object structure */
  inObj.value = merge(inObj.value ?? {}, initializer?.())

  const outObj = shallowRef<GetValueType<T>>()
  const errors = ref<Record<string, string | undefined>>({})
  const error = computed(() => {
    return Object.values(errors.value)[0]
  })
  const modelValid = computed(() => Object.values(errors.value).length === 0)

  const processValidation = async (data: any, path: string = '') => {
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

  /** Flag if values have been validated once */
  const flaggedSet = new Set<string>()
  /** Value has been altered */
  const touchedSet = new Set<string>()

  const isFlagged = (path: string) => {
    for (const key of flaggedSet.keys()) {
      if (path.startsWith(key)) {
        return true
      }
    }
  }

  const createAccessors = (path: string) => {
    return {
      get value() {
        return get(inObj.value, path)
      },
      set value(value: any) {
        set(inObj.value, path, value)
        triggerRef(inObj)
        touchedSet.add(path)
      },
      get error() {
        return errors.value[path]
      },
      get isValid() {
        return !errors.value[path]
      },
      get touched() {
        return touchedSet.has(path)
      },
      get bind() {
        const self = this // eslint-disable-line @typescript-eslint/no-this-alias
        return {
          input: self.onInput.bind(self),
          change: self.onChange.bind(self),
          blur: self.onChange.bind(self)
        }
      },
      onInput() {
        if (this.error ?? isFlagged(path)) {
          this.validate()
        }
      },
      onChange() {
        if (touchedSet.has(path)) {
          this.validate()
        }
      },
      validate() {
        if (validator) {
          flaggedSet.add(path)
          void processValidation(get(inObj.value, path), path)
        }
      }
    }
  }

  /** Create accessors lazily for retrieved paths */
  const accessorMap = new Map<string, ReturnType<typeof createAccessors>>()

  const modelGetter = function(path?: Exclude<Paths<GetValueType<T>>, number>) {
    if (arguments.length === 0) {
      return inObj.value
    }
    let accessor = accessorMap.get(path!)
    if (!accessor) {
      accessor = createAccessors(path!)
      accessorMap.set(path!, accessor)
    }
    return accessor
  } as Model<T>

  Object.defineProperties(modelGetter, {
    value: {
      enumerable: true,
      get: () => inObj.value,
      set: (value: any) => {
        inObj.value = value
      }
    },
    validate: {
      enumerable: true,
      value() {
        void processValidation(inObj.value)
      }
    },
    validatedValue: {
      enumerable: true,
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
      enumerable: true,
      get() {
        return error.value
      }
    },
    touched: {
      enumerable: true,
      get() {
        return touchedSet.size > 0
      }
    }
  })

  if (validator && options.validateOnMount) {
    void processValidation(inObj.value, '')
  }

  return modelGetter
}
