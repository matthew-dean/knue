import { safeParseAsync, type GenericSchema, getDotPath, getDefaults } from 'valibot'
import { ValidationError, type ValidationFunction } from '../lib/validation'
import get from 'lodash/get'

export const createValidator: ValidationFunction = function<
  S extends GenericSchema = GenericSchema
>(schema: S) {
  return async (data: unknown, initialPath: string): Promise<[ValidationError, null | undefined] | [null | undefined, any]> => {
    let localSchema = schema
    if (initialPath) {
      /** Get sub-schema */
      const newPath = `entries.${initialPath.replace(/\./g, '.entries.')}`
      localSchema = get(schema, newPath)
    }
    const result = await safeParseAsync(localSchema, data)

    if (!result.success) {
      const validationError = new ValidationError(result.issues[0].message)
      for (const issue of result.issues) {
        const path = initialPath + `${getDotPath(issue) ?? ''}`
        if (path) {
          validationError.errors[path] = issue.message
        }
      }
      return [validationError, null]
    }
    return [null, result.output]
  }
}

export const createInitializer = function<
  S extends GenericSchema = GenericSchema
>(schema: S) {
  // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
  return () => getDefaults(schema)
}
