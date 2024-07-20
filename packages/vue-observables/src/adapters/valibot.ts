import { safeParseAsync, type GenericSchema, getDotPath } from 'valibot'
import { ValidationError, type ValidationFunction } from '../validation'

export const validate: ValidationFunction = async function<
  const T = unknown,
  S extends GenericSchema = GenericSchema
>(data: T, schema: S): Promise<[ValidationError, null | undefined] | [null | undefined, T]> {
  const result = await safeParseAsync(schema, data)
  if (!result.success) {
    const validationError = new ValidationError(result.issues[0].message)
    for (const issue of result.issues) {
      const path = getDotPath(issue)
      if (path) {
        validationError.errors[path] = issue.message
      }
    }
    return [validationError, null]
  }
  return [null, result.output as T]
}
