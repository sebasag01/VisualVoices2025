import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment'; // Asegúrate de que la ruta es correcta

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

  // Manejar la selección del archivo
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  // Subir el archivo al backend
  uploadFile(event: Event) {
    event.preventDefault();

    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      // Usar apiUrl desde el entorno
      const uploadUrl = `${environment.apiUrl}/gltf/upload`;

      this.http.post(uploadUrl, formData).subscribe(
        (response) => {
          console.log('Archivo subido:', response);
          alert('Archivo subido correctamente');
        },
        (error) => {
          console.error('Error al subir archivo:', error);
          alert('Error al subir archivo');
        }
      );
    } else {
      alert('Por favor selecciona un archivo.');
    }
  }
}

