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
let onoff = true;

const animacion = [
    'models/lengua/lengua.gltf',
    'models/lengua/lengua_1.gltf',
    'models/lengua/lengua_2.gltf',
    'models/lengua/lengua_3.gltf',
    // 'models/lengua/lengua_4.gltf',
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
    });
}

function updatePose() {
    if (avatar) scene.remove(avatar); 
    avatar = poses[currentPoseIndex];
    scene.add(avatar); 
    currentPoseIndex = (currentPoseIndex + 1) % poses.length; 
    // while(onoff){
    //     setTimeout(() => {

    //     }, 500);
    // }
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);

    setTimeout(() => {
        updatePose();
    }, 1000); //1seg
}

cargarPoses();
