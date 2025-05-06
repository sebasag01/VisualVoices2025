import TRecurso from './TRecurso.js';

class TRecursoMalla extends TRecurso {
    constructor() {
        super();
        // Buffers para los datos de la malla
        this.vertices = null;    // float array para vértices
        this.normales = null;    // float array para normales
        this.coordTexturas = null; // float array para coordenadas de textura
        this.indices = null;     // int array para índices
    }

    async cargarFichero(nombre) {
        this.SetNombre(nombre);
        try {
            // Cargar el archivo GLTF embebido (JSON)
            //const response = await fetch(`./assets/${nombre}`);
            const response = await fetch(`frontend/src/assets/cubo.gltf`);
            const gltf = await response.json();

            // Cargar el buffer embebido (base64)
            const bufferView = gltf.bufferViews[0];
            const buffer = gltf.buffers[0];
            // Extraer el base64 del URI (data:application/octet-stream;base64,....)
            const base64 = buffer.uri.split(',')[1];
            const bin = atob(base64);
            const bytes = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) {
                bytes[i] = bin.charCodeAt(i);
            }

            // Accesores
            const mesh = gltf.meshes[0];
            const primitive = mesh.primitives[0];

            // Vértices
            const posAccessor = gltf.accessors[primitive.attributes.POSITION];
            const posOffset = gltf.bufferViews[posAccessor.bufferView].byteOffset || 0;
            this.vertices = new Float32Array(
                bytes.buffer,
                posOffset,
                posAccessor.count * 3
            );

            // Normales
            if (primitive.attributes.NORMAL !== undefined) {
                const normAccessor = gltf.accessors[primitive.attributes.NORMAL];
                const normOffset = gltf.bufferViews[normAccessor.bufferView].byteOffset || 0;
                this.normales = new Float32Array(
                    bytes.buffer,
                    normOffset,
                    normAccessor.count * 3
                );
            }

            // Coordenadas de textura
            if (primitive.attributes.TEXCOORD_0 !== undefined) {
                const texAccessor = gltf.accessors[primitive.attributes.TEXCOORD_0];
                const texOffset = gltf.bufferViews[texAccessor.bufferView].byteOffset || 0;
                this.coordTexturas = new Float32Array(
                    bytes.buffer,
                    texOffset,
                    texAccessor.count * 2
                );
            }

            // Índices
            if (primitive.indices !== undefined) {
                const idxAccessor = gltf.accessors[primitive.indices];
                const idxView = gltf.bufferViews[idxAccessor.bufferView];
                const idxOffset = idxView.byteOffset || 0;
                // Puede ser UNSIGNED_SHORT o UNSIGNED_INT
                if (idxAccessor.componentType === 5123) { // UNSIGNED_SHORT
                    this.indices = new Uint16Array(
                        bytes.buffer,
                        idxOffset,
                        idxAccessor.count
                    );
                } else if (idxAccessor.componentType === 5125) { // UNSIGNED_INT
                    this.indices = new Uint32Array(
                        bytes.buffer,
                        idxOffset,
                        idxAccessor.count
                    );
                }
            }
        } catch (error) {
            console.error('Error al cargar el fichero GLTF:', error);
            throw error;
        }
    }

    // Método para dibujar la malla usando WebGL
    draw(gl, programInfo, matrizTransf) {
        if (!this.vertices || !this.indices) {
            console.error('No hay datos de malla para dibujar');
            return;
        }

        // Crear y configurar buffers de WebGL
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

        const normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.normales, gl.STATIC_DRAW);

        const texcoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.coordTexturas, gl.STATIC_DRAW);

        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        // Configurar atributos
        const positionLocation = gl.getAttribLocation(programInfo.program, 'a_position');
        const normalLocation = gl.getAttribLocation(programInfo.program, 'a_normal');
        const texcoordLocation = gl.getAttribLocation(programInfo.program, 'a_texcoord');

        // Establecer la matriz de transformación
        const matrixLocation = gl.getUniformLocation(programInfo.program, 'u_matrix');
        gl.uniformMatrix4fv(matrixLocation, false, matrizTransf);

        // Habilitar atributos
        gl.enableVertexAttribArray(positionLocation);
        gl.enableVertexAttribArray(normalLocation);
        gl.enableVertexAttribArray(texcoordLocation);

        // Configurar punteros a atributos
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
        gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

        // Dibujar la malla
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);

        // Limpiar
        gl.disableVertexAttribArray(positionLocation);
        gl.disableVertexAttribArray(normalLocation);
        gl.disableVertexAttribArray(texcoordLocation);
    }
}

export default TRecursoMalla; 