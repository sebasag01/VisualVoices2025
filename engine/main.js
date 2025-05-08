// WebGL - Skinning glTF
// from http://localhost:8082/webgl/webgl-skinning-3d-gltf-skinned.html

"use strict";

import TNodo from './entidades/TNodo.js';
import TMalla from './entidades/TMalla.js';
import TLuz from './entidades/TLuz.js';
import TCamara from './entidades/TCamara.js';
import TGestorRecursos from './recursos/TGestorRecursos.js';
//import { vec3, mat4 } from '../node_modules/gl-matrix/esm/index.js';
import { mat4, vec3 } from 'gl-matrix';


// Shaders
const vsSource = `
    attribute vec4 a_position;
    attribute vec3 a_normal;
    attribute vec2 a_texcoord;
    
    uniform mat4 u_matrix;
    
    varying vec3 v_normal;
    varying vec2 v_texcoord;
    
    void main() {
        gl_Position = u_matrix * a_position;
        v_normal = a_normal;
        v_texcoord = a_texcoord;
    }
`;

const fsSource = `
    precision mediump float;
    uniform vec3 u_lightColor;
    void main() {
        gl_FragColor = vec4(vec3(0.6) * u_lightColor, 1.0); // Gris modulado por la luz
    }
`;

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Error al inicializar el programa shader: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Error al compilar los shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function dibujarMalla(gl, programInfo, angle, camara, luz) {
    // Define los vértices de un cubo
    const vertices = new Float32Array([
        // Cara frontal
        -0.5, -0.5,  0.5,
         0.5, -0.5,  0.5,
         0.5,  0.5,  0.5,
        -0.5,  0.5,  0.5,
        // Cara trasera
        -0.5, -0.5, -0.5,
         0.5, -0.5, -0.5,
         0.5,  0.5, -0.5,
        -0.5,  0.5, -0.5,
    ]);

    // Índices para las caras del cubo
    const indices = new Uint16Array([
        // Frente
        0, 1, 2,  2, 3, 0,
        // Atrás
        4, 5, 6,  6, 7, 4,
        // Izquierda
        4, 0, 3,  3, 7, 4,
        // Derecha
        1, 5, 6,  6, 2, 1,
        // Arriba
        3, 2, 6,  6, 7, 3,
        // Abajo
        4, 5, 1,  1, 0, 4
    ]);

    // Buffer de vértices
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Buffer de índices
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    // Atributo de posición
    const posLoc = programInfo.attribLocations.vertexPosition;
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);

    // Matriz de modelo
    const model = mat4.create();
    mat4.rotateY(model, model, angle);

    // Matriz de vista: posición de la cámara (por ejemplo, [0,0,3]), mira al origen
    const view = mat4.create();
    // Puedes obtener la posición de la cámara de tu objeto camara si lo implementas
    mat4.lookAt(view, [0, 0, 3], [0, 0, 0], [0, 1, 0]);

    // Matriz de proyección desde la cámara
    const projection = camara.getProyeccion();

    // MVP = projection * view * model
    const mvp = mat4.create();
    mat4.multiply(mvp, view, model);
    mat4.multiply(mvp, projection, mvp);

    gl.uniformMatrix4fv(programInfo.uniformLocations.matrix, false, mvp);

    // Pasa la intensidad de la luz al shader
    gl.uniform3fv(programInfo.uniformLocations.lightColor, luz.getIntensidad());

    // Dibuja el cubo
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

export async function main(gl) {
    if (!gl) {
        console.error('No se pudo inicializar WebGL');
        return;
    }

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    //gl.clearColor(0.2, 0.6, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Crear y configurar el programa shader
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'a_position'),
            vertexNormal: gl.getAttribLocation(shaderProgram, 'a_normal'),
            textureCoord: gl.getAttribLocation(shaderProgram, 'a_texcoord'),
        },
        uniformLocations: {
            matrix: gl.getUniformLocation(shaderProgram, 'u_matrix'),
            lightColor: gl.getUniformLocation(shaderProgram, 'u_lightColor'),
        },
    };
    
    // Crear el nodo raíz de la escena
    const escena = new TNodo("Escena");
    
    // Crear los nodos para cada entidad
    const nodoMalla = new TNodo("Malla");
    const nodoLuz = new TNodo("Luz");
    const nodoCamara = new TNodo("Camara");
    
    // Crear el gestor de recursos
    const gestorRecursos = new TGestorRecursos();

    // Esperar a que se cargue el recurso cubo.gltf
    const recursoMalla = await gestorRecursos.getRecurso('malanimation.gltf');
    console.log(recursoMalla);

    // Crear la malla usando el recurso cargado
    const malla = new TMalla(gl, programInfo, recursoMalla);
    const luz = new TLuz();
    const camara = new TCamara();
    
    // Asignar las entidades a sus nodos
    nodoMalla.setEntidad(malla);
    nodoLuz.setEntidad(luz);
    nodoCamara.setEntidad(camara);
    
    // Configurar las transformaciones iniciales
    nodoMalla.setTraslacion([0, -1, -5]);
    nodoLuz.setTraslacion([5, 5, 0]);
    nodoCamara.setTraslacion([0, 0, 0]);
    
    // Configurar rotaciones iniciales
    nodoMalla.setRotacion(vec3.fromValues(0, 0, 0));
    nodoLuz.setRotacion(vec3.fromValues(0, 0, 0));
    nodoCamara.setRotacion(vec3.fromValues(0, 0, 0));
    
    // Configurar escalados iniciales
    nodoMalla.setEscalado(vec3.fromValues(1, 1, 1));
    nodoLuz.setEscalado(vec3.fromValues(1, 1, 1));
    nodoCamara.setEscalado(vec3.fromValues(1, 1, 1));
    
    // Construir la jerarquía
    escena.addHijo(nodoMalla);
    escena.addHijo(nodoLuz);
    escena.addHijo(nodoCamara);
    
    // Configurar WebGL
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    
    // Iniciar el bucle de renderizado
    const matrizIdentidad = mat4.create();
    
    let angle = 0;
    
    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(programInfo.program);
        gl.enable(gl.CULL_FACE);

        // Obtener la matriz de transformación del nodo de la malla
        const modelMatrix = nodoMalla.getMatrizTransf();
        
        // Crear matriz de vista
        const view = mat4.create();
        mat4.lookAt(view, [0, 0, 3], [0, 0, 0], [0, 1, 0]);

        // Obtener matriz de proyección
        const projection = camara.getProyeccion();

        // Calcular matriz MVP
        const mvp = mat4.create();
        mat4.multiply(mvp, view, modelMatrix);
        mat4.multiply(mvp, projection, mvp);

        // Dibujar la malla con la matriz MVP
        malla.dibujar(mvp);

        angle += 0.01;
        requestAnimationFrame(render);
    }
    
    // Iniciar el renderizado
    render();
    
    return escena;
}

setTimeout(() => {
  main(canvas);
}, 100);

export default main;
