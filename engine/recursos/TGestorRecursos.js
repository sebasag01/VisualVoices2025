import TRecurso from './TRecurso.js';
import TRecursoMalla from './TRecursoMalla.js';
import TRecursoTextura from './TRecursoTextura.js';

class TGestorRecursos {
    constructor() {
        this.recursos = []; // Vector de TRecurso
    }

    async getRecurso(nombre) {
        let rec = this.buscarRecurso(nombre);
        if (!rec) {
            rec = this.crearRecurso(nombre);
            console.log("ARRAY RECURSOS ", rec)
            if (!rec) {
                console.warn(`Tipo de recurso no soportado para: ${nombre}`);
                return null;
            }
            try {
                await rec.cargarFichero(nombre);
                this.recursos.push(rec);
            } catch (error) {
                console.error(`No se pudo cargar el recurso: ${nombre}`, error);
                return null;
            }
        }
        return rec;
    }

    buscarRecurso(nombre) {
        return this.recursos.find(recurso => recurso.GetNombre() === nombre);
    }

    crearRecurso(nombre) { 
        const extension = nombre.split('.').pop().toLowerCase();
        if (extension === 'gltf') {
            return new TRecursoMalla();
        } else if (extension === 'png' || extension === 'jpg' || extension === 'jpeg') {
            return new TRecursoTextura();
        } else {
            // Aquí puedes añadir más tipos en el futuro
            return null;
        }
    }
}

export default TGestorRecursos; 