import TEntidad from './TEntidad';
import { m4, quat, vec3 } from './math';

// export default class Animation {
class Animation extends TEntidad {
  /**
   * @param {Object} options
   * @param {string} options.animUrl   - URL of the glTF animation (.gltf or .glb)
   * @param {Array<string>} [options.meshUrls]      - mesh resource URLs
   * @param {Array<string>} [options.textureUrls]   - texture URLs
   * @param {Array<string>} [options.materialDefs]  - material definitions or URLs
   * @param {boolean} [options.loop=true] - should animation loop
   */
  constructor({ animUrl, meshUrls = [], textureUrls = [], materialDefs = [], loop = true }) {
    this.animUrl = animUrl;
    this.meshUrls = meshUrls;
    this.textureUrls = textureUrls;
    this.materialDefs = materialDefs;
    this.loop = loop;

    this.duration = 0;
    this.currentTime = 0;
    this.playing = false;

    this.samplers = [];   // { input: Float32Array, output: Float32Array, path: string, node: Node }
    this.channels = [];   // maps samplers to targets

    //recursos
    this.meshes = [];
    this.textures = [];
    this.materials = [];
  }

  /**
   * Load all resources: meshes, textures, materials, and animation data
   * @returns {Promise<void>}
   */
  async load() {
    this.meshes = await Promise.all(
      this.meshUrls.map(url => ResourceManager.loadMesh(url))
    );
    this.textures = await Promise.all(
      this.textureUrls.map(url => ResourceManager.loadTexture(url))
    );
    this.materials = await Promise.all(
      this.materialDefs.map(def => ResourceManager.loadMaterial(def))
    );

    const gltf = await ResourceManager.loadJSON(this.animUrl);
    const { animations, nodes } = gltf;
    if (!animations || !animations.length) {
      throw new Error('No animations in glTF');
    }

    const clip = animations[0];
    for (let i = 0; i < clip.samplers.length; i++) {
      const s = clip.samplers[i];
      const input = ResourceManager.getAccessorData(gltf, s.input);
      const output = ResourceManager.getAccessorData(gltf, s.output);
      this.samplers.push({ input, output, interpolation: s.interpolation });
    }
    this.duration = this.samplers[0].input[ this.samplers[0].input.length - 1 ];

    clip.channels.forEach(ch => {
      const sampler = this.samplers[ch.sampler];
      const targetNode = nodes[ch.target.node];
      const path = ch.target.path; // 'translation'|'rotation'|'scale'
      this.channels.push({ sampler, node: targetNode, path });
    });
  }
  play() {
    this.playing = true;
  }

  pause() {
    this.playing = false;
  }

  stop() {
    this.playing = false;
    this.currentTime = 0;
  }

  /**
   * Update animation state by delta time
   * @param {number} deltaTime - seconds since last update
   */
  update(deltaTime) {
    if (!this.playing || this.duration <= 0) return;
    this.currentTime += deltaTime;
    if (this.loop) {
      this.currentTime %= this.duration;
    } else if (this.currentTime > this.duration) {
      this.currentTime = this.duration;
      this.playing = false;
    }

    this.channels.forEach(({ sampler, node, path }) => {
      const inArr = sampler.input;
      const outArr = sampler.output;
      let idx = 0;
      while (idx + 1 < inArr.length && inArr[idx + 1] < this.currentTime) idx++;
      const t0 = inArr[idx], t1 = inArr[idx + 1];
      const alpha = (this.currentTime - t0) / (t1 - t0);
      const stride = (path === 'rotation') ? 4 : 3;
      const base0 = idx * stride;
      const base1 = (idx + 1) * stride;
      if (path === 'rotation') {
        quat.slerp(
          node.source.rotation,
          outArr.subarray(base0, base0 + 4),
          outArr.subarray(base1, base1 + 4),
          alpha
        );
      } else {
        const arr = node.source[path];
        for (let k = 0; k < stride; k++) {
          arr[k] = outArr[base0 + k] * (1 - alpha) + outArr[base1 + k] * alpha;
        }
      }
    });
  }

  destroy() {
    this.meshes.forEach(mesh => mesh.destroy());
    this.textures.forEach(tex => tex.destroy());
    this.materials.forEach(mat => mat.destroy());
    this.samplers = null;
    this.channels = null;
  }
}
