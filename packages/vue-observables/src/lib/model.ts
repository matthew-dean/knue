/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ref, computed, isRef, shallowRef, triggerRef, customRef, type Ref, reactive, toRaw, watch } from 'vue'
import type { PartialDeep, Paths, Get } from 'type-fest'
/** Switch to https://github.com/developit/dlv */
import get from 'lodash/get'
/** Switch to https://github.com/lukeed/dset */
import set from 'lodash/set'
import isObject from 'lodash/isObject'
import merge from 'lodash/merge'
import type { ValidationError } from './validation'
import { ReactiveFlags } from './constants'

export interface BaseModel<T extends Record<string, any>> {
  value: PartialDeep<T>
  readonly ref: Ref<T>
  errors: Record<string, string | undefined>
  /** First error */
  readonly error: string | undefined
  readonly touched: boolean
  readonly isValid: boolean
  readonly validatedValue: T | undefined
  readonly validate: () => void
  (): PartialDeep<T>
  <U extends Exclude<Paths<T>, number>>(path: U): {
    value: Get<T, U>
    ref: Ref<Get<T, U>>
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
    (): Get<T, U>
    (value: Get<T, U>): void
  }
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
    /**
     * Runs validator for every change to the model,
     * without needing to be explicitly called or
     * hooked to onChange events.
     */
    validateOnChange?: boolean
  }
) {
  options ??= {}
  const { validator, initializer } = options
  const valueIsRef = isRef(initialValue)

  /** Create starting object structure */
  let initialObj = reactive(merge(
    (valueIsRef ? toRaw(initialValue as Ref<PartialDeep<T>> | Ref<unknown>).value : initialValue) ?? {},
    initializer?.()
  )) as PartialDeep<T>

  if (valueIsRef) {
    /** Sync merged object */
    initialValue.value = initialObj
  }

  let gettingSubPath = false

  /** Allows reading sub-paths without creating recursive dependencies */
  const inObj = customRef((track, trigger) => ({
    get() {
      if (gettingSubPath) {
        return initialObj
      }
      track()
      return initialObj
    },
    set(value: any) {
      initialObj = value
      if (valueIsRef) {
        /** Sync outgoing value */
        initialValue.value = value
      }
      trigger()
    }
  }))

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  if (options!.validateOnChange) {
    /**
     * @todo - Find a more efficient way than a deep watcher
     */
    watch(inObj, () => {
      void processValidation(inObj.value)
    }, { deep: true })
  }

  const outObj = shallowRef<GetValueType<T>>()
  const errors = ref<Record<string, string | undefined>>({})
  const error = computed(() => {
    return Object.values(errors.value)[0]
  })

  /** Make sure any errors set to `undefined` don't count */
  const modelValid = computed(() => Object.values(errors.value)
    .filter(val => val !== undefined)
    .length === 0)

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
    /**
     * Mimic observable()
     * @todo - Make this a real observable?
     */
    const observable = function(value?: any) {
      if (arguments.length === 0) {
        gettingSubPath = true
        const val = get(inObj.value, path)
        gettingSubPath = false
        return val
      }
      set(inObj.value, path, value)
      triggerRef(inObj)
      touchedSet.add(path)
    }

    const refObj = {
      get value() {
        return observable()
      },
      set value(value: any) {
        observable(value)
      },
      get [ReactiveFlags.IS_REF]() {
        return true
      }
    }

    return Object.defineProperties(observable, {
      value: {
        enumerable: true,
        get() {
          return observable()
        },
        set(value: any) {
          observable(value)
        }
      },
      ref: {
        enumerable: true,
        get() {
          return refObj
        }
      },
      error: {
        enumerable: true,
        get() {
          return errors.value[path]
        }
      },
      isValid: {
        enumerable: true,
        get() {
          return !errors.value[path]
        }
      },
      touched: {
        enumerable: true,
        get() {
          return touchedSet.has(path)
        }
      },
      handlers: {
        enumerable: true,
        get() {
          const self: any = observable
          return {
            input: self.onInput.bind(self),
            change: self.onChange.bind(self),
            blur: self.onChange.bind(self)
          }
        }
      },
      onInput: {
        enumerable: true,
        value() {
          const self: any = observable
          if (self.error ?? isFlagged(path)) {
            self.validate()
          }
        }
      },
      onChange: {
        enumerable: true,
        get() {
          if (touchedSet.has(path)) {
            (observable as any).validate()
          }
        }
      },
      validate: {
        enumerable: true,
        get() {
          if (validator) {
            flaggedSet.add(path)
            void processValidation(get(inObj.value, path), path)
          }
        }
      }
    })
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
    ref: {
      enumerable: true,
      get() {
        return inObj
      }
    },
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

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  if (validator && options!.validateOnMount) {
    void processValidation(inObj.value, '')
  }

  return modelGetter
}
