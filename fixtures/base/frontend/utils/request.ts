import type { RpcClient } from 'vite-plugin-rpc/client'
import createRpcClient from 'vite-plugin-rpc/client'

export function useRequest(): RpcClient {
  return createRpcClient()
}
