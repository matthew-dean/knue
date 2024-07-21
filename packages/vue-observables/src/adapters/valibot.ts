import { safeParseAsync, type GenericSchema, getDotPath } from 'valibot'
import { ValidationError, type ValidationFunction } from '../validation'
import get from 'lodash/get'

export const validate: ValidationFunction = function<
  S extends GenericSchema = GenericSchema
>(schema: S) {
  return async (data: unknown, path: string): Promise<[ValidationError, null | undefined] | [null | undefined, any]> => {
    let localSchema = schema
    if (path) {
      /** Get sub-schema */
      const newPath = `entries.${path.replace(/\./g, '.entries.')}`
      localSchema = get(schema, newPath)
    }
    const result = await safeParseAsync(localSchema, data)

    if (!result.success) {
      const validationError = new ValidationError(result.issues[0].message)
      for (const issue of result.issues) {
        path += `${getDotPath(issue) ?? ''}`
        if (path) {
          validationError.errors[path] = issue.message
        }
      }
      return [validationError, null]
    }
    return [null, result.output]
  }
}
