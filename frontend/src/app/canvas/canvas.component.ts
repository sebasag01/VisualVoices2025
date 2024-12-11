import { Component, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { GLTFLoader } from 'three-stdlib';
import gsap from 'gsap';


@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [],
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css'] 
})
export class CanvasComponent implements AfterViewInit {
  @ViewChild('webglCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  

  ngAfterViewInit(): void {
    this.initScene();
    this.initCamera();
    this.initRenderer();
    this.addLights();
    this.loadModel();
    this.addControls();
    this.animate();
    this.handleResize();
  }

  private initScene(): void {
    this.scene = new THREE.Scene();
  }

  private initCamera(): void {
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    this.camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
    this.camera.position.set(0, -10, 15);
    this.camera.lookAt(0, 0, 0); // Apunta al centro de la escena
    this.scene.add(this.camera)
  }

  private initRenderer(): void {
    if (!this.canvasRef) {
      console.error('Canvas element not found.');
      return;
    }
    const canvas = this.canvasRef.nativeElement;
    this.renderer = new THREE.WebGLRenderer({ canvas });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    //this.renderer.setClearColor(0xf5f5dc); // Color de fondo crema
  }

  private addLights(): void {
    const light = new THREE.PointLight(0xffffff, 1, 0.000001);
    light.position.set(10, 10, 10);
    this.scene.add(light);

    /*const light2 = new THREE.PointLight(0xffffff, 1, 0.02);
    light2.position.set(-10, -10, -10);
    this.scene.add(light2);*/
  }

  private loadModel(): void {
    const loader = new GLTFLoader();
    loader.load(
      'assets/Modelo_pruebas.gltf',
      (gltf) => {
        const model = gltf.scene;
  
        // Ajustar posición y escala
        model.position.set(0, 0, 0); // Centrar el modelo
        model.scale.set(3, 3, 3);   // Escala normal
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.material = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Color rojo
            mesh.material.needsUpdate = true;
          }
        });
        // Verificar que el modelo se haya cargado correctamente
        console.log('Modelo cargado:', model);
  
        this.scene.add(model);
  
        // Animación inicial
        const tl = gsap.timeline({ defaults: { duration: 1 } });
        tl.fromTo(model.scale, { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 });
      },
      undefined,
      (error) => console.error('Error al cargar el modelo:', error)
    );
  }

  private addControls(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
  }

  private animate(): void {
    const loop = () => {
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(loop);
    };
    loop();
  }

  private handleResize(): void {
    window.addEventListener('resize', () => {
      const sizes = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
      this.camera.aspect = sizes.width / sizes.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(sizes.width, sizes.height);
    });
  }
}
