import { Middleware } from "../types.ts";

export class MiddlewarePipeline {
  private middlewares: Middleware[] = [];

  addMiddleware(middleware: Middleware): void {
    this.middlewares.push(middleware);
  }

  async do(data: Uint8Array): Promise<Uint8Array> {
    for (const middleware of this.middlewares) {
      data = await middleware.do(data);
    }
    return data;
  }

  async undo(data: Uint8Array): Promise<Uint8Array> {
    for (const middleware of this.middlewares.slice().reverse()) {
      data = await middleware.undo(data);
    }
    return data;
  }
}
