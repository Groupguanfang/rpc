/* eslint-disable ts/explicit-function-return-type */
import { z } from 'zod'

export namespace JsonRpcSchema {
  export function createRequestSchema<ParamsSchema extends z.ZodTuple>(paramsSchema?: ParamsSchema) {
    if (!paramsSchema)
      paramsSchema = z.array(z.any()) as any
    return z.object({
      jsonrpc: z.literal('2.0'),
      id: z.union([z.string(), z.number()]),
      method: z.string(),
      params: paramsSchema,
    })
  }

  export type RequestSchema = z.infer<ReturnType<typeof createRequestSchema>>

  export function createResponseSuccessSchema<Result extends z.ZodSchema>(result?: Result) {
    if (!result)
      result = z.any() as any
    return z.object({
      jsonrpc: z.literal('2.0'),
      id: z.union([z.string(), z.number()]),
      result,
    })
  }

  export type ResponseSuccessSchema = z.infer<ReturnType<typeof createResponseSuccessSchema>>

  export function createResponseErrorSchema<Error extends z.ZodSchema>(error?: Error) {
    if (!error)
      error = z.any() as any
    return z.object({
      jsonrpc: z.literal('2.0'),
      id: z.union([z.string(), z.number()]),
      error: z.object({
        code: z.number(),
        message: z.string(),
        data: error,
      }),
    })
  }

  export type ResponseErrorSchema = z.infer<ReturnType<typeof createResponseErrorSchema>>

  export function createResponseSchema<Result extends z.ZodSchema, Error extends z.ZodSchema>(result?: Result, error?: Error) {
    return z.union([
      createResponseSuccessSchema(result),
      createResponseErrorSchema(error),
    ])
  }

  export type ResponseSchema<Result extends z.ZodSchema, Error extends z.ZodSchema> = z.infer<ReturnType<typeof createResponseSchema<Result, Error>>>
}
