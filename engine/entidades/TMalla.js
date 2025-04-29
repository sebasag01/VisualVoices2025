import TEntidad from './TEntidad.js';
import TRecursoMalla from '../recursos/TRecursoMalla.js';

class TMalla extends TEntidad {
    constructor(gl, programInfo) {
        super();
        this.malla = null; // TRecursoMalla
        this.gl = gl;
        this.programInfo = programInfo;
        this.cargarMalla('../recursos/cubo.gltf');
    }

    // Método para cargar la malla desde un fichero
    cargarMalla(fichero) {
        // Crear y cargar el recurso de malla
        this.malla = new TRecursoMalla();
        this.malla.cargarFichero(fichero);
        console.log('Cargando malla desde:', fichero);
    }

    // Implementación del método dibujar heredado de TEntidad
    dibujar(matrizTransf) {
        if (!this.gl || !this.programInfo) return;
        const gl = this.gl;
        const program = this.programInfo.program;
        gl.useProgram(program);

        // Crear un buffer de prueba
        const vertices = new Float32Array([
            0.0,  0.5, 0.0,
           -0.5, -0.5, 0.0,
            0.5, -0.5, 0.0
        ]);
        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        const posLoc = this.programInfo.attribLocations.vertexPosition;
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);

        // Uniform de matriz (si lo usas)
        gl.uniformMatrix4fv(this.programInfo.uniformLocations.matrix, false, matrizTransf);

        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
}

export default TMalla; 