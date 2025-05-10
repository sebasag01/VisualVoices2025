class TRecurso {
    constructor() {
        this.nombre = '';
        
        // Asegurar que esta clase es abstracta
        if (this.constructor === TRecurso) {
            throw new Error('TRecurso es una clase abstracta y no puede ser instanciada directamente.');
        }
    }

    // Getter para el nombre
    GetNombre() {
        return this.nombre;
    }

    // Setter para el nombre
    SetNombre(nombre) {
        this.nombre = nombre;
    }

    dibujar(matrizTransf) {
        if (!this.malla) return;

        // Activar la textura si existe
        if (this.textura) {
            this.textura.activar(this.gl, 0);
            const textureLocation = this.gl.getUniformLocation(this.programInfo.program, 'u_texture');
            this.gl.uniform1i(textureLocation, 0);
        }

        this.malla.draw(this.gl, this.programInfo, matrizTransf);
    }
}

export default TRecurso;
