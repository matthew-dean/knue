export class ValidationError extends Error {
  errors: Record<string, string> = {}
}

type BaseValidationOutput = [ValidationError, null | undefined] | [null | undefined, any]
export type ValidationOutput = BaseValidationOutput | Promise<BaseValidationOutput>
export type ValidationFunction = (...args: any[]) => (data: unknown, path: string) => ValidationOutput
