import { Component, ElementRef, AfterViewInit, ViewChild, Input } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { GLTFLoader } from 'three-stdlib';
import { AnimacionService } from '../services/animacion.service'; // Importa el servicio

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [],
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css'],
})
export class CanvasComponent implements AfterViewInit {
  @ViewChild('webglCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  @Input() animationUrls: string[] = []; // Recibe las URLs de las animaciones

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private loader: GLTFLoader = new GLTFLoader();
  private currentPoseIndex: number = 0;
  private poses: THREE.Group[] = [];
  private avatar!: THREE.Group;

  constructor(private animacionService: AnimacionService) {
    // Suscribirse al servicio para recibir las animaciones
    this.animacionService.animaciones$.subscribe((urls: string[]) => {
      if (urls.length > 0) {
        console.log('URLs de las animaciones recibidas:', urls);
        this.cargarAnimacionesDinamicas(urls);
      }
    });
  }

  ngAfterViewInit(): void {
    this.initScene();
    this.initCamera();
    this.initRenderer();
    this.addLights();
    this.addControls();
    this.loadDefaultPose(); // Cargar la pose inicial por defecto
    this.animate();
    this.handleResize();
  }

  private initScene(): void {
    this.scene = new THREE.Scene();
  }

  private initCamera(): void {
    const sizes = { width: window.innerWidth, height: window.innerHeight };
    this.camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
    this.camera.position.set(0, 1, 5);
    this.scene.add(this.camera);
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
    this.renderer.setClearColor(0xf5f5dc);
  }

  private addLights(): void {
    const light = new THREE.PointLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    this.scene.add(light);
  }

  private addControls(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.minPolarAngle = Math.PI / 2;
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.minAzimuthAngle = -Math.PI / 6;
    this.controls.maxAzimuthAngle = Math.PI / 6;
    this.controls.update();
  }

  private cargarAnimacionesDinamicas(urls: string[]): void {
    this.poses = []; // Reinicia las poses, pero no limpies la escena.
  
    const promises = urls.map((url) => {
      return new Promise<THREE.Group>((resolve, reject) => {
        this.loader.load(
          url,
          (gltf) => resolve(gltf.scene),
          undefined,
          (error) => reject(error)
        );
      });
    });
  
    Promise.all(promises)
      .then((loadedPoses) => {
        this.poses = loadedPoses;
        console.log('Nuevas animaciones cargadas.');
        this.reproducirAnimacionSecuencial();
      })
      .catch((error) => console.error('Error cargando las animaciones:', error));
  }
  

  private reproducirAnimacionSecuencial(): void {
    let index = 0;
  
    const poseInterval = setInterval(() => {
      const currentPose = this.poses[index]; // Obtén la nueva pose actual.
  
      if (this.avatar) {
        // Reemplaza solo los hijos actuales del avatar sin eliminarlo de la escena.
        this.avatar.clear(); // Limpia los hijos del avatar existente.
        currentPose.children.forEach((child) => {
          this.avatar.add(child.clone()); // Clona y agrega los nuevos hijos.
        });
      } else {
        // Si no existe avatar, inicialízalo con la primera pose.
        this.avatar = currentPose.clone();
        this.scene.add(this.avatar);
      }
  
      index++;
      if (index >= this.poses.length) {
        clearInterval(poseInterval); // Detén la animación cuando termine.
        console.log('Animación completada.');
      }
    }, 1000); // Intervalo de tiempo entre frames (ajustable).
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
      const sizes = { width: window.innerWidth, height: window.innerHeight };
      this.camera.aspect = sizes.width / sizes.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(sizes.width, sizes.height);
    });
  }

  private loadDefaultPose(): void {
    const defaultPoseUrl = 'assets/models/hola/hola.gltf'; // URL ajustada
  
    this.loader.load(
      defaultPoseUrl,
      (gltf) => {
        this.avatar = gltf.scene; // Asigna el modelo cargado a la variable avatar
        this.scene.add(this.avatar); // Añade el modelo a la escena
        console.log('Pose inicial cargada correctamente.');
      },
      undefined,
      (error) => {
        console.error('Error al cargar la pose inicial:', error);
      }
    );
  }
  
}
