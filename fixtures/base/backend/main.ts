import { createRpcServer, Rpc } from 'vite-plugin-rpc/server'
import { WelcomeServer } from '../common/welcome-protocol'

@Rpc(WelcomeServer)
export class WelcomeServerImpl implements WelcomeServer {
  sayHello(): string {
    return 'Hello, World!'
  }
}

export default createRpcServer()
