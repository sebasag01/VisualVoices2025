// src/types/engine-main.d.ts
declare module 'engine/main.js' {
  /**
   * Arranca la demo básica del motor.
   * @param gl Contexto WebGL ya creado (WebGLRenderingContext o WebGL2RenderingContext)
   */
  export function main(gl: WebGLRenderingContext | WebGL2RenderingContext): void;
}
