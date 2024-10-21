import type { ClassMethodReturnTypePromisify } from 'vite-plugin-rpc/client'
import { WelcomeServer } from '../../common/welcome-protocol'
import { useRequest } from '../utils/request'

export function useWelcomeServer(): ClassMethodReturnTypePromisify<WelcomeServer> {
  const request = useRequest()

  return request.get<WelcomeServer>(WelcomeServer)
}
