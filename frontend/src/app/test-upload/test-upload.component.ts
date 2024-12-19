import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-test-upload',
  standalone: true,
  templateUrl: './test-upload.component.html',
  styleUrls: ['./test-upload.component.css'],
  imports: [],
})
export class TestUploadComponent {
  selectedFile: File | null = null;

  constructor(private http: HttpClient) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'model/gltf+json' || file.name.endsWith('.gltf')) {
      this.selectedFile = file;
    } else {
      alert('Por favor, selecciona un archivo GLTF válido.');
      event.target.value = '';
    }
  }

  uploadFile(event: Event) {
    event.preventDefault();

    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      const uploadUrl = `${environment.apiUrl}/gltf/upload`;

      this.http.post(uploadUrl, formData, { 
        withCredentials: true,
        observe: 'response'
      }).subscribe({
        next: (response) => {
          console.log('Archivo subido:', response);
          alert('Archivo subido correctamente');
          // Limpiar el input file
          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
          this.selectedFile = null;
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error completo:', error);
          let errorMessage = 'Error al subir el archivo: ';
          
          if (error.error instanceof ErrorEvent) {
            errorMessage += error.error.message;
          } else {
            errorMessage += `Código ${error.status}: ${error.message}`;
          }
          
          alert(errorMessage);
        }
      });
    } else {
      alert('Por favor selecciona un archivo.');
    }
  }
}
