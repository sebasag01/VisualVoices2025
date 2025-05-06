import TEntidad from './TEntidad.js';
import TRecursoMalla from '../recursos/TRecursoMalla.js';

class TMalla extends TEntidad {
    constructor(gl, programInfo, recursoMalla) {
        super();
        this.gl = gl;
        this.programInfo = programInfo;
        this.malla = recursoMalla; // TRecursoMalla con los datos cargados
    }

    dibujar(matrizTransf) {
        if (!this.malla) return;
        this.malla.draw(this.gl, this.programInfo, matrizTransf);
    }
}

export default TMalla; 