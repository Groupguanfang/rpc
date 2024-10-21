const ClassContainer = new Map<string | symbol, any>()

export function Rpc(symbol: string | symbol) {
  return (target: any, _ctx: ClassDecoratorContext) => {
    ClassContainer.set(symbol, target)
  }
}

export function createRpcServer(): Map<string | symbol, any> {
  return ClassContainer
}
