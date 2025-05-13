import TEntidad from './TEntidad.js';
import TRecursoMalla from '../recursos/TRecursoMalla.js';
import TRecursoTextura from '../recursos/TRecursoTextura.js';

class TMalla extends TEntidad {
    constructor(gl, programInfo, recursoMalla, recursoTextura = null) {
        super();
        this.gl = gl;
        this.programInfo = programInfo;
        this.malla = recursoMalla; // TRecursoMalla con los datos cargados
        this.textura = recursoTextura; // TRecursoTextura con la textura cargada
    }

    dibujar(matrizTransf) {
        if (!this.malla) return;

        // Activar la textura si existe
        if (this.textura) {
            this.textura.activar(this.gl, 0);
            const textureLocation = this.gl.getUniformLocation(this.programInfo.program, 'u_texture');
            this.gl.uniform1i(textureLocation, 0);
        }

        let texcoordBuffer = null;
        const texcoordLocation = this.gl.getAttribLocation(this.programInfo.program, 'a_texcoord');
        if (texcoordLocation !== -1 && this.coordTexturas) {
            texcoordBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texcoordBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, this.coordTexturas, this.gl.STATIC_DRAW);
            this.gl.enableVertexAttribArray(texcoordLocation);
            this.gl.vertexAttribPointer(texcoordLocation, 2, this.gl.FLOAT, false, 0, 0);
        }

        this.malla.draw(this.gl, this.programInfo, matrizTransf);
    }
}

export default TMalla; 