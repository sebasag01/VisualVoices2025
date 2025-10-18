export default class ResourceManager {
  static meshCache = new Map();
  static textureCache = new Map();
  static materialCache = new Map();
  static jsonCache = new Map();
  static arrayBufferCache = new Map();

  /**
   * Carga una malla 
   * @param {string} url
   * @returns {Promise<Mesh>}
   */
  static async loadMesh(url) {
    if (this.meshCache.has(url)) {
      return this.meshCache.get(url);
    }
    const mesh = await this._fetchAndParseMesh(url);
    this.meshCache.set(url, mesh);
    return mesh;
  }

  /**
   * Carga una textura a partir de una URL o Blob URL
   * @param {string} url
   * @returns {Promise<WebGLTexture>}
   */
  static async loadTexture(url) {
    if (this.textureCache.has(url)) {
      return this.textureCache.get(url);
    }
    const img = await this._loadImage(url);
    const tex = this._createGLTexture(img);
    this.textureCache.set(url, tex);
    return tex;
  }

  /**
   * Carga o crea un material a partir de una definición (JSON o URL)
   * @param {Object|string} def - Definición de material o URL a JSON
   * @returns {Promise<Material>}
   */
  static async loadMaterial(def) {
    const key = typeof def === 'string' ? def : JSON.stringify(def);
    if (this.materialCache.has(key)) {
      return this.materialCache.get(key);
    }
    let matDef = def;
    if (typeof def === 'string') {
      matDef = await this.loadJSON(def);
    }
    const material = this._createMaterialFromDef(matDef);
    this.materialCache.set(key, material);
    return material;
  }

  /**
   * Carga y parsea JSON, cacheando resultados.
   * @param {string} url
   * @returns {Promise<any>}
   */
  static async loadJSON(url) {
    if (this.jsonCache.has(url)) {
      return this.jsonCache.get(url);
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error(`No se pudo cargar JSON: ${url}`);
    const data = await res.json();
    this.jsonCache.set(url, data);
    return data;
  }

  /**
   * Carga binario (ArrayBuffer), cacheando.
   * @param {string} url
   * @returns {Promise<ArrayBuffer>}
   */
  static async loadBinary(url) {
    if (this.arrayBufferCache.has(url)) {
      return this.arrayBufferCache.get(url);
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error(`No se pudo cargar binario: ${url}`);
    const buffer = await res.arrayBuffer();
    this.arrayBufferCache.set(url, buffer);
    return buffer;
  }

  /**
   * Obtiene datos de accessor en glTF (Float32Array, Vec3, etc.)
   * @param {Object} gltf - Objeto GLTF completo
   * @param {number} accessorIndex
   * @returns {TypedArray}
   */
  static getAccessorData(gltf, accessorIndex) {
    const accessor = gltf.accessors[accessorIndex];
    const view = gltf.bufferViews[accessor.bufferView];
    const buffer = gltf.buffers[view.buffer];
    const ArrayType = this._glTypeToTypedArray(accessor.componentType);
    return new ArrayType(
      buffer,
      (view.byteOffset || 0) + (accessor.byteOffset || 0),
      accessor.count * this._numComponents(accessor.type)
    );
  }

  static _fetchAndParseMesh(url) {
    // Implementar parser OBJ/GLTF... return Promise<Mesh>
    throw new Error('_fetchAndParseMesh no implementado');
  }

  static _loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
  }

  static _createGLTexture(image) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return tex;
  }

  static _createMaterialFromDef(def) {

    throw new Error('_createMaterialFromDef no implementado');
  }

  static _glTypeToTypedArray(type) {
    switch (type) {
      case 5126: return Float32Array; // gl.FLOAT
      case 5123: return Uint16Array; // gl.UNSIGNED_SHORT
      case 5125: return Uint32Array; // gl.UNSIGNED_INT
      // añadir otros tipos si es necesario
      default: throw new Error(`Tipo GL no soportado: ${type}`);
    }
  }

  static _numComponents(accessorType) {
    switch (accessorType) {
      case 'SCALAR': return 1;
      case 'VEC2':   return 2;
      case 'VEC3':   return 3;
      case 'VEC4':   return 4;
      case 'MAT4':   return 16;
      default: throw new Error(`Tipo accessor no soportado: ${accessorType}`);
    }
  }
}
