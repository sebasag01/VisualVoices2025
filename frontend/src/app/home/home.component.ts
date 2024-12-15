import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { CategoriasService } from '../services/categorias.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent], 
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  categorias: any[] = []; // Lista de categorías obtenidas de la base de datos
  palabras: any[] = []; // Lista de palabras obtenidas de la base de datos
  currentCategoryId: string | null = null; // Categoría actual seleccionada

  constructor(private categoriasService: CategoriasService) {}

  ngOnInit(): void {
    this.cargarCategorias(); // Cargar las categorías al inicio
  }

  cargarCategorias(): void {
    this.categoriasService.obtenerCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
        console.log('Categorías cargadas:', this.categorias);
      },
      error: (error) => {
        console.error('Error al cargar las categorías:', error);
      },
    });
  }

  selectCategory(categoriaId: string): void {
    this.currentCategoryId = categoriaId;
    this.categoriasService.obtenerPalabrasPorCategoria(categoriaId).subscribe({
        next: (data) => {
            this.palabras = data;
            console.log(`Palabras cargadas con animaciones completas:`, this.palabras);
        },
        error: (error) => {
            console.error('Error al cargar las palabras:', error);
        },
    });
}


  seleccionarPalabra(palabra: any): void {
    console.log('Palabra seleccionada:', palabra);

    if (palabra.animaciones && palabra.animaciones.length > 0) {
        console.log(`Cargando animaciones para ${palabra.palabra}:`);
        console.log('Estructura de animaciones:', palabra.animaciones);

        palabra.animaciones.forEach((animacion: any, index: number) => {
            if (typeof animacion === 'object' && animacion !== null) {
                console.log(`Frame ${index + 1}: ${animacion.filename}`);
                const url = `http://localhost:3000/api/gltf/animaciones/${animacion.filename}`;
                console.log(`URL de la animación: ${url}`);
            } else {
                console.warn(`El campo animaciones no es un objeto. Valor recibido:`, animacion);
            }
        });

        console.log('Se están "cargando" los archivos de animación...');
    } else {
        console.warn('No hay animaciones asociadas a esta palabra.');
    }
  }


  
  

  /*
  cargarAnimacionesSecuenciales(animaciones: any[]): void {
    const loader = new THREE.GLTFLoader();
  
    let index = 0;
  
    const cargarSiguienteFrame = () => {
      if (index < animaciones.length) {
        const url = `http://localhost:3000/api/gltf/animaciones/${animaciones[index].filename}`;
        console.log(`Cargando frame: ${url}`);
  
        loader.load(
          url,
          (gltf) => {
            // Reemplaza o actualiza la escena con el nuevo frame
            scene.clear(); // Opcional: limpia la escena anterior
            scene.add(gltf.scene);
            index++;
            setTimeout(cargarSiguienteFrame, 500); // Intervalo entre frames
          },
          undefined,
          (error) => {
            console.error('Error al cargar el frame:', error);
          }
        );
      } else {
        console.log('Animación completada.');
      }
    };
  
    cargarSiguienteFrame();
  }
  */
}
