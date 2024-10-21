import type { Connect, PluginOption } from 'vite'
import type { Options } from './types'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { cwd } from 'node:process'
import * as swc from 'unplugin-swc'
import { JsonRpcSchema } from './schema'

async function readBody(req: Connect.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', () => {
      resolve(data)
    })
    req.on('error', reject)
  })
}

function json(body: string): any {
  try {
    return JSON.parse(body || '{}')
  }
  catch (_) {
    ;(() => _)()
    return {}
  }
}

function useMiddleware(container: Map<string | symbol, any>): Connect.NextHandleFunction {
  function create404Response(data: Record<string, any>): JsonRpcSchema.ResponseErrorSchema {
    return JsonRpcSchema.createResponseErrorSchema().parse({
      jsonrpc: '2.0',
      id: randomUUID(),
      error: {
        code: 404,
        message: 'Not Found',
        data: {
          errorType: 'NotFoundError',
          errorDetail: data,
        },
      },
    } as JsonRpcSchema.ResponseErrorSchema)
  }

  function createValidateErrorResponse(data: Record<string, any>): JsonRpcSchema.ResponseErrorSchema {
    return JsonRpcSchema.createResponseErrorSchema().parse({
      jsonrpc: '2.0',
      id: randomUUID(),
      error: {
        code: 400,
        message: 'Invalid Request',
        data: {
          errorType: 'ValidateError',
          errorDetail: data,
        },
      },
    } as JsonRpcSchema.ResponseErrorSchema)
  }

  return async (req, res) => {
    const result = JsonRpcSchema.createRequestSchema().safeParse(json(await readBody(req) || ''))
    if (result.success === false)
      return res.end(JSON.stringify(createValidateErrorResponse(result.error.format())))

    const [target, method] = result.data.method.split('.')
    const instance = Reflect.construct(container.get(target), [])
    if (!instance || !instance[method]) {
      return res.end(JSON.stringify(create404Response({
        target,
        method,
      })))
    }

    return res.end(JSON.stringify(JsonRpcSchema.createResponseSuccessSchema().parse({
      jsonrpc: '2.0',
      id: randomUUID(),
      result: await instance[method](...result.data.params),
    } as JsonRpcSchema.ResponseSuccessSchema)))
  }
}

export function Rpc(options: Options = {}): PluginOption {
  return [
    ((swc.default as any).default as any).vite({
      jsc: {
        transform: {
          decoratorVersion: '2022-03',
        },
        parser: {
          syntax: 'typescript',
          decorators: true,
          tsx: true,
        },
      },
    } as swc.Options),
    {
      name: 'naily:vite-plugin-rpc',
      apply: 'serve',

      config(config) {
        config.esbuild = false
      },

      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const defaultExport: Map<string | symbol, any> = (await server.ssrLoadModule(options.entry || path.join(cwd(), 'backend/main.ts'))).default
          if ((req.url || '').startsWith(options.baseURL || '/api') && (req.method === 'POST' || req.method === 'post'))
            return useMiddleware(defaultExport)(req, res, next)
          else return next()
        })
      },
    },
  ]
}

export default Rpc
