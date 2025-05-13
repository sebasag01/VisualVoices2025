declare module 'engine/skinEngine.js' {
  export function startSkinEngine(
    canvas: HTMLCanvasElement,
    gltfUrl?: string,
    getThreeCameras?: () => {
      projectionMatrix: Float32Array;
      viewMatrix:     Float32Array;
    }
  ): Promise<() => void>;
}
