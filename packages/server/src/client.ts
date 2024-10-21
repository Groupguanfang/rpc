import type { AxiosResponse } from 'axios'
import axios from 'axios'
import { JsonRpcSchema } from './schema'

export type ReturnTypePromisify<T extends (...args: any[]) => any> = T extends (...args: any[]) => Promise<any>
  ? T
  : (...args: Parameters<T>) => Promise<ReturnType<T>>

export type ClassMethodReturnTypePromisify<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? ReturnTypePromisify<T[K]> : T[K]
}

export interface RpcClient {
  get: <T extends Record<string, any>>(symbol: string | symbol) => ClassMethodReturnTypePromisify<T>
}

export function createRpcClient(url: string = '/api'): RpcClient {
  return {
    get<T extends Record<string, any>>(symbol: string | symbol): ClassMethodReturnTypePromisify<T> {
      return new Proxy({}, {
        get(_, p) {
          return async function (...args: any[]) {
            const result = await axios({
              method: 'POST',
              url,
              headers: {
                'Content-Type': 'application/json',
              },
              data: JsonRpcSchema.createRequestSchema().parse({
                jsonrpc: '2.0',
                id: crypto.randomUUID(),
                method: `${symbol.toString()}.${p.toString()}`,
                params: args,
              } as JsonRpcSchema.RequestSchema),
            })
            return result.data.result
          }
        },
      }) as any
    },
  }
}

export default createRpcClient
