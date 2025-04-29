declare module '*.js' {
  export function main(gl: WebGLRenderingContext | WebGL2RenderingContext | null): void;
} 

setTimeout(() => {
  const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
  if (gl) {
    main(canvas);
  } else {
    console.error('No se pudo crear el contexto WebGL');
  }
}, 100); 