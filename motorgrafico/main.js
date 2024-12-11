import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light);

const loader = new GLTFLoader();
let currentPoseIndex = 0;
let poses = [];
let avatar;
//let onoff = true;
let animationInProgress = false;

const animacion = [
    'models/hola/hola.gltf',
    'models/hola/hola_1.gltf',
    'models/hola/hola_2.gltf',
    'models/hola/hola_3.gltf',
    'models/hola/hola_4.gltf',
];

function cargarPoses() {
    const promises = animacion.map((poseFile) => {
        return new Promise((resolve, reject) => {
            loader.load(
                poseFile,
                (gltf) => resolve(gltf.scene),
                undefined,
                (error) => reject(error)
            );
        });
    });

    Promise.all(promises).then((loadedPoses) => {
        poses = loadedPoses;
        avatar = poses[0];
        scene.add(avatar);
        animate();
        startPoseAnimation();
    });
}

// function updatePose() {
//     if (avatar) scene.remove(avatar); 
//     avatar = poses[currentPoseIndex];
//     scene.add(avatar); 
//     currentPoseIndex = (currentPoseIndex + 1) % poses.length; 
// }

function startPoseAnimation() {
    if (animationInProgress) return;
    animationInProgress = true;

    const poseInterval = setInterval(() => {
        if (avatar) scene.remove(avatar);

        //cambiamos de pose
        avatar = poses[currentPoseIndex];
        scene.add(avatar);

        currentPoseIndex++; 

        if (currentPoseIndex >= poses.length) {
            clearInterval(poseInterval); 
            animationInProgress = false;
            console.log("Fin animacion.");
        }
    }, 2000);//2seg
}


function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);

    // setTimeout(() => {
    //     updatePose();
    // }, 1000); //1seg
}

cargarPoses();
