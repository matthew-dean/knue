import type {
  Class
} from 'type-fest'

/**
 * Constructor function must either return an object,
 * or return a function that returns an object.
 */
type ConstructorFunction =
  (...args: any[]) => Record<any, any>
  | ((...args: any[]) => (() => Record<any, any>))

type ConstructorReturn<T extends ConstructorFunction> =
  T extends (...args: any[]) => (() => infer R)
    ? R
    : ReturnType<T>

const proxyHandler: ProxyHandler<any> = {
  get(target, key) {
    if (key === Symbol.hasInstance) {
      return (instance: any) => {
        return instance instanceof target
      }
    }
    return Reflect.get(target, key)
  }
}

export const create = <T extends ConstructorFunction>(fn: T) => {
  const instances = new WeakSet<any>()
  const returnFunction = function(...args: Parameters<T>): ConstructorReturn<T> {
    let result = fn(...args) as ConstructorReturn<T>
    if (typeof result === 'function') {
      result = result()
    }
    result = new Proxy(result, proxyHandler)
    instances.add(result)
    return result
  } as unknown as Class<ConstructorReturn<T>, Parameters<T>>

  Object.defineProperty(returnFunction, Symbol.hasInstance, {
    value(instance: any) {
      return instances.has(instance)
    }
  })

  return returnFunction
}
