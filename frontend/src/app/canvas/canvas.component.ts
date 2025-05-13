import {
  Component,
  ElementRef,
  AfterViewInit,
  ViewChild,
  Input,
  OnDestroy,
  Output,            // <--- AÑADIDO
  EventEmitter       // <--- AÑADIDO
} from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { GLTFLoader } from 'three-stdlib';
import { AnimacionService, AnimationData } from '../services/animacion.service';
import { GltfService } from '../services/gltf.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css'],
})
export class CanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('threeCanvas', { static: false }) threeCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('skinCanvas',  { static: false }) skinCanvas!: ElementRef<HTMLCanvasElement>;

  @Input() animationUrls: string[] = [];
  @Input() showResetButton: boolean = false;

  // NUEVO: emisor para avisar de que la animación ha terminado (una sola vez)
  @Output() animationEnded = new EventEmitter<void>();  // <--- AÑADIDO

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private loader: GLTFLoader = new GLTFLoader();
  private isMainActive: boolean = false;

  

  /** Array de grupos (poses) para la animación secuencial */
  private poses: THREE.Group[] = [];

  /** Avatar actual en la escena */
  private avatar!: THREE.Group | undefined;

  /** Intervalo para reproducir poses secuencialmente */
  private poseInterval: any = null;

  /** Suscripción a los datos de animación (animaciones + loop) */
  private animacionSubscription: Subscription;

  constructor(
    private animacionService: AnimacionService,
    private gltfService: GltfService
  ) {
    // Nos suscribimos al BehaviorSubject que emite { animaciones, loop }
    this.animacionSubscription = this.animacionService.animaciones$.subscribe(
      (data: AnimationData) => {
        // data.animaciones => array de URLs
        // data.loop => true (repetir) / false (una sola vez)
        
        if (data.animaciones.length > 0&&!this.isMainActive) {
          const permitido = this.animacionService.permitirReproduccion();
          console.log('Recibida petición de animación:', data, '¿permitido?', permitido);

          if (permitido) {
            // Pequeño retraso opcional
            setTimeout(() => {
              if (this.animacionService.permitirReproduccion()) {
                this.cargarAnimacionesDinamicas(data.animaciones, data.loop);
              }
            }, 50);
          } else {
            console.log('No se permite reproducción => limpiar');
            this.limpiarCanvas();
          }
        } else {
          // Sin animaciones => limpiar
          this.limpiarCanvas();
        }
      }
    );
  }

   ngOnDestroy() {
    this.animacionSubscription.unsubscribe();
    this.stopSkin?.();
  }

  ngAfterViewInit(): void {
    this.initScene();
    this.initCamera();
    this.initThreeRenderer();
    this.addLights();
    this.addControls();
    this.loadDefaultPose(); // Pose inicial
    this.animate();
    this.handleResize();
  }

  // --------------------------------------------------
  // INICIALIZAR ESCENA, CÁMARA, LUCES, CONTROLES
  // --------------------------------------------------
  private initScene() {
    this.scene = new THREE.Scene();
  }

  private initCamera() {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    this.camera.position.set(0, 0, 5.8);
    this.camera.lookAt(0, 0, 0);
  }

   private initThreeRenderer() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.threeCanvas.nativeElement, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);  // transparente
    this.addLights();
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  }

  private addLights(): void {
    const light = new THREE.PointLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    this.scene.add(light);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    this.scene.add(dirLight);
  }

  private addControls(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = true;
    this.controls.autoRotate = false;
    this.controls.update();
  }

  // --------------------------------------------------
  // CARGA DE ANIMACIONES (POSIBLES POSES) Y REPRODUCCIÓN
  // --------------------------------------------------
  private cargarAnimacionesDinamicas(animaciones: string[], loop: boolean): void {
    if (this.isMainActive) return;
    // 1) Detenemos animación previa, pero sin recargar la pose
    this.stopLoop(false);

    if (!this.animacionService.permitirReproduccion()) {
      console.log('Reproducción no permitida. Saliendo.');
      return;
    }

    this.poses = [];
    
    const promises = animaciones.map((url) => {
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
        console.log('Animaciones cargadas:', this.poses.length, 'poses');
        this.reproducirAnimacionSecuencial(loop);
      })
      .catch((error) => console.error('Error cargando animaciones:', error));
  }

  private reproducirAnimacionSecuencial(loop: boolean): void {
    // Detener cualquier animación previa
    if (this.isMainActive) return;
    // Just in case, paramos algo previo
    this.stopLoop(false);
    
    let index = 0;
    this.poseInterval = setInterval(() => {
      const currentPose = this.poses[index];
    
      if (this.avatar) {
        this.avatar!.clear();
        currentPose.children.forEach(child => {
          this.avatar!.add(child.clone());
        });
      } else {
        // Primera vez: crear el avatar
        this.avatar = currentPose.clone();
  
        // Aplicar transformaciones de forma consistente:
        // 1. Resetear la posición
        this.avatar.position.set(0, 0, 0);
  
        // 2. Calcular el centro y restarlo para centrar el avatar
        const box = new THREE.Box3().setFromObject(this.avatar);
        const center = box.getCenter(new THREE.Vector3());
        this.avatar.position.sub(center);
  
        // 3. Aplicar una escala fija
        this.avatar.scale.set(1.5, 1.5, 1.5);
  
        // 4. Aplicar un offset vertical fijo (por ejemplo, bajar 1.1 unidades)
        this.avatar.position.y -= 1.2;
  
        // Agregar a la escena
        this.scene.add(this.avatar);
      }
    
      index++;
      if (index >= this.poses.length) {
        if (loop) {
          index = 0; // Repetir desde la primera
        } else {
          clearInterval(this.poseInterval);
          this.poseInterval = null;
          console.log('Animación completada (una sola vez).');

          // NUEVO: Emitir evento de final de animación
          this.animationEnded.emit();  // <--- AÑADIDO
        }
      }
    }, 120);
  }
  
  

  /**
   * Detener la animación secuencial actual.
   * @param revertToDefault Si es true, limpiamos y recargamos la pose inicial.
   */
  public stopLoop(revertToDefault: boolean): void {
    if (this.isMainActive) return;
    // 1) Parar el intervalo
    if (this.poseInterval) {
      clearInterval(this.poseInterval);
      this.poseInterval = null;
    }
    console.log('Animación detenida. revertToDefault:', revertToDefault);

    if (revertToDefault) {
      // Limpiar el canvas (quita avatar) y recargar pose inicial
      this.limpiarCanvas();
      this.loadDefaultPose(true);
    }
  }

  // --------------------------------------------------
  // POSE INICIAL
  // --------------------------------------------------
  /** Cargar la pose inicial o "modelo por defecto". */
  private loadDefaultPose(force = false): void {
    if (this.isMainActive) return;
    // Si no forzamos y hay animaciones, no cargamos la pose
    if (!force && this.animacionService.hayAnimacionesActivas()) {
      return;
    }
    console.log('Cargando pose inicial (modelo por defecto)...');

    this.gltfService.getDefaultModel().subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        this.loader.load(
          url,
          (gltf) => {
            this.avatar = gltf.scene;
            // Centrar
            const box = new THREE.Box3().setFromObject(this.avatar);
            const center = box.getCenter(new THREE.Vector3());
            this.avatar.position.sub(center);

            this.avatar.scale.set(1.5, 1.5, 1.5);
            this.avatar.position.y -= 1.2;
            this.scene.add(this.avatar);

            URL.revokeObjectURL(url);
            console.log('Pose inicial lista');
          },
          undefined,
          (err) => {
            console.error('Error cargando pose inicial:', err);
            URL.revokeObjectURL(url);
          }
        );
      },
      error: (err) => {
        console.error('Error obteniendo modelo por defecto:', err);
      },
    });
  }

  // --------------------------------------------------
  // LIMPIAR Y OTRAS UTILIDADES
  // --------------------------------------------------
  limpiarCanvas(): void {
    if (this.isMainActive) return;
    if (this.avatar) {
      this.scene.remove(this.avatar);
      this.avatar.clear();
      this.avatar = undefined;
    }
    this.poses = [];
    console.log('Canvas limpiado: avatar removido, poses vacías');
  }

  private animate() {
    const loop = () => {
      // sólo render Three.js si el skinEngine NO está activo
      if (!this.skinRunning) {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
      }
      requestAnimationFrame(loop);
    };
    loop();
  }

  private handleResize(): void {
    window.addEventListener('resize', () => {
      if (!this.isMainActive) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        if (this.camera instanceof THREE.PerspectiveCamera) {
          this.camera.aspect = w / h;
          this.camera.updateProjectionMatrix();
        }
        this.renderer.setSize(w, h);
      }
    });
  }

  public resetView(): void {
    if (this.isMainActive) return;
    // Reposicionar la cámara, si lo deseas
    this.camera.position.set(0, 1.5, 8.5);
    this.camera.lookAt(0, 0, 0);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  private stopSkin?: () => void;
  public get skinRunning(): boolean {
    return !!this.stopSkin;
  }
   async toggleSkin() {
      if (this.stopSkin) {
        this.stopSkin();
        this.stopSkin = undefined;
        this.skinCanvas.nativeElement.style.display = 'none';
        return;
      }
      // arrancamos el skin engine
      const { startSkinEngine } = await import('engine/skinEngine.js');
      this.stopSkin = await startSkinEngine(
      this.skinCanvas.nativeElement,
        'assets/malanimation.gltf',
        () => ({
          // envolvemos el array de números en un Float32Array
          projectionMatrix: new Float32Array(this.camera.projectionMatrix.elements),
          viewMatrix:       new Float32Array(this.camera.matrixWorldInverse.elements)
        })
      );
      this.skinCanvas.nativeElement.style.display = 'block';
    }


}
