import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PalabrasService } from '../services/palabras.service';
import { ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoriasService } from '../services/categorias.service'; // Importa el servicio de categorías

@Component({
  selector: 'app-admin-palabras',
  standalone: true,
  imports: [CommonModule,FormsModule],
  encapsulation: ViewEncapsulation.None,
    styleUrls: [
      './admin.component.scss'
    ],
  template: `
  <div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h2>Gestión de Palabras</h2>
      <button class="btn btn-success" (click)="toggleModal()">Agregar Palabra</button>
    </div>
    <div class="card-body">
      <!-- Tabla de palabras -->
      <table class="table table-striped table-hover">
        <thead>
          <tr>
            <th>ID</th>
            <th>Palabra</th>
            <th>Categoría</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let palabra of palabras">
            <td>{{ palabra._id }}</td>
            <td>{{ palabra.palabra }}</td>
            <td>{{ palabra.categoria?.nombre || 'Sin categoría' }}</td>
            <td>
              <button class="btn btn-primary btn-sm me-2" (click)="editarPalabra(palabra)">Editar</button>
              <button class="btn btn-danger btn-sm" (click)="borrarPalabra(palabra._id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Modal -->
  <div *ngIf="showModal" class="modal-backdrop" (click)="closeModalOnBackdrop($event)">
    <div class="modal-content">
      <h3>{{ isEditing ? 'Editar Palabra' : 'Agregar Nueva Palabra' }}</h3>
      <form (ngSubmit)="submitForm()">
        <div class="form-group">
          <label for="palabra">Palabra</label>
          <input type="text" id="palabra" [(ngModel)]="nuevaPalabra.palabra" name="palabra" required />
        </div>
        <div class="form-group">
          <label for="categoria">Categoría</label>
          <select id="categoria" [(ngModel)]="nuevaPalabra.categoria" name="categoria">
            <option [ngValue]="null">Sin categoría</option>
            <option *ngFor="let categoria of categorias" [ngValue]="categoria._id">{{ categoria.nombre }}</option>
          </select>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" (click)="toggleModal()">Cancelar</button>
          <button type="submit" class="btn btn-primary">{{ isEditing ? 'Actualizar' : 'Guardar' }}</button>
        </div>
      </form>
    </div>
  </div>

  `,
})

export class AdminPalabrasComponent implements OnInit {
  palabras: any[] = [];
  categorias: any[] = [];
  showModal = false;
  isEditing = false; // Indica si estamos en modo edición
  nuevaPalabra = { palabra: '', categoria: null };
  palabraId: string | null = null; // Almacena el ID de la palabra en edición

  constructor(private palabrasService: PalabrasService, private categoriasService: CategoriasService) {}

  ngOnInit() {
    this.obtenerPalabras();
    this.obtenerCategorias();
  }

  obtenerPalabras() {
    this.palabrasService.obtenerPalabras().subscribe({
      next: (data) => {
        console.log('Palabras recibidas:', data);
        this.palabras = Array.isArray(data) ? data : data.palabras || [];
      },
      error: (err) => {
        console.error('Error al obtener palabras:', err);
      },
    });
  }

  obtenerCategorias() {
    this.categoriasService.obtenerCategorias().subscribe({
      next: (data) => {
        console.log('Categorías recibidas:', data);
        this.categorias = Array.isArray(data) ? data : data.categorias || [];
      },
      error: (err) => {
        console.error('Error al obtener categorías:', err);
      },
    });
  }

  toggleModal() {
    this.showModal = !this.showModal;
    if (!this.showModal) {
      this.isEditing = false; // Restablece el estado
      this.nuevaPalabra = { palabra: '', categoria: null }; // Resetea el formulario
      this.palabraId = null;
    }
  }

  closeModalOnBackdrop(event: MouseEvent) {
    if ((event.target as HTMLElement).className === 'modal-backdrop') {
      this.toggleModal();
    }
  }

  submitForm() {
    if (this.isEditing) {
        // Editar palabra existente
        this.palabrasService.editarPalabra(this.palabraId!, this.nuevaPalabra).subscribe({
            next: (data) => {
                console.log('Palabra actualizada:', data);
                const index = this.palabras.findIndex(p => p._id === this.palabraId);
                if (index !== -1) {
                    this.palabras[index] = data.palabra; // Actualiza la palabra en la lista
                }
                this.toggleModal();
            },
            error: (err) => {
                console.error('Error actualizando palabra:', err);
            },
        });
    } else {
        // Crear nueva palabra
        this.palabrasService.crearPalabra(this.nuevaPalabra).subscribe({
            next: (data) => {
                console.log('Palabra creada:', data);
                this.palabras.push(data.palabra); // Agrega la nueva palabra a la lista
                this.toggleModal();
            },
            error: (err) => {
                console.error('Error creando palabra:', err);
            },
        });
      }
  }

  editarPalabra(palabra: any) {
    this.isEditing = true; // Cambia a modo edición
    this.palabraId = palabra._id; // Almacena el ID de la palabra a editar
    this.nuevaPalabra = { palabra: palabra.palabra, categoria: palabra.categoria?._id || null }; // Carga los datos en el formulario
    this.toggleModal(); // Abre el modal
  }

  borrarPalabra(id: string) {
    if (confirm('¿Estás seguro de que deseas eliminar esta palabra?')) {
      this.palabrasService.borrarPalabra(id).subscribe({
        next: () => {
          console.log('Palabra eliminada:', id);
          this.palabras = this.palabras.filter((p) => p._id !== id);
        },
        error: (err) => {
          console.error('Error eliminando palabra:', err);
        },
      });
    }
  }
}

