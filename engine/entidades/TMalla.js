import TEntidad from './TEntidad.js';
import TRecursoMalla from '../recursos/TRecursoMalla.js';

class TMalla extends TEntidad {
    constructor(gl, programInfo) {
        super();
        console.log('Creando TMalla');
        this.malla = null; // TRecursoMalla
        this.gl = gl;
        this.programInfo = programInfo;
        // Por ahora, usaremos el cubo generado en TRecursoMalla en lugar de cargar un GLTF
        this.malla = new TRecursoMalla();
        console.log('TMalla creada con éxito');
    }

    // Implementación del método dibujar heredado de TEntidad
    dibujar(matrizTransf) {
        //console.log('TMalla.dibujar - Inicio');
        if (!this.malla || !this.gl || !this.programInfo) {
            console.error('No hay malla cargada o falta el contexto GL');
            return;
        }
        //console.log('TMalla.dibujar - Matriz de transformación:', matrizTransf);
        // Llamar al método draw del recurso malla con el contexto GL y el programa
        this.malla.draw(this.gl, this.programInfo, matrizTransf);
        console.log('TMalla.dibujar - Fin');
    }
}

export default TMalla; 