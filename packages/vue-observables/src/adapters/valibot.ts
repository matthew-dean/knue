import { safeParseAsync, type GenericSchema, getDotPath, getDefaults } from 'valibot'
import { ValidationError, type ValidationFunction } from '../lib/validation'

export const createValidator: ValidationFunction = function<
  S extends GenericSchema = GenericSchema
>(schema: S) {
  return async (data: unknown, initialPath: string): Promise<[ValidationError, null | undefined] | [null | undefined, any]> => {
    /**
     * Validate the entire schema, but we'll filter by path.
     *
     * This is necessary because a field might depend on another field
     * during validation, so even if we want errors for a specific field,
     * we need to validate the entire schema to get the correct field-specific
     * errors.
     */
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
    return [null, result.output]
  }
}

export const createInitializer = function<
  S extends GenericSchema = GenericSchema
>(schema: S) {
  // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
  return () => getDefaults(schema)
}
