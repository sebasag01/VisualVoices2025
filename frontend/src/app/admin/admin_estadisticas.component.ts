import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http'

import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartData, ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-admin-estadisticas',
  standalone: true,
  imports: [CommonModule, FormsModule,HttpClientModule,BaseChartDirective   ],
  providers: [
    provideCharts(withDefaultRegisterables())
  ],
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./admin.component.scss'], // Usa el mismo estilo que en admin
  template: `
    <div class="container mt-3">
    <h2>Estadísticas del Modo Guiado</h2>

    <div *ngIf="errorMensaje" class="alert alert-danger" role="alert">
      {{ errorMensaje }}
    </div>
    <div *ngIf="cargando" class="alert alert-info" role="alert">
      Cargando estadísticas...
    </div>

    <!-- TABLA 1: Distribución de Usuarios por Nivel -->
    <div class="card" *ngIf="!cargando && datosEstadisticas">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h3>Distribución de Usuarios por Nivel</h3>
      </div>
      <div class="card-body">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>Nivel</th>
              <th>Número de Usuarios</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let dist of datosEstadisticas.distribucionNiveles">
              <td>{{ dist.level }}</td>
              <td>{{ dist.count }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TABLA 2: Tiempo en Cada Nivel -->
    <div class="card" *ngIf="!cargando && datosEstadisticas">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h3>Tiempo en Cada Nivel (ms)</h3>
      </div>
      <div class="card-body">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>Nivel</th>
              <th>Promedio</th>
              <th>Mínimo</th>
              <th>Máximo</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let tiempo of datosEstadisticas.tiemposPorNivel">
              <td>{{ tiempo._id }}</td>
              <td>{{ tiempo.promedio | number }}</td>
              <td>{{ tiempo.minimo }}</td>
              <td>{{ tiempo.maximo }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TABLA 3: Sesiones diarias y duración promedio -->
    <div class="card mt-3">
        <div class="card-header">
          <h3>Sesiones diarias y duración promedio (ejemplo estático)</h3>
        </div>
        <div class="card-body">
          <canvas
            baseChart
            [data]="barChartData"
            [options]="barChartOptions"
            [type]="barChartType"
          >
          </canvas>
        </div>
      </div>

  </div>

  `,
})
export class AdminEstadisticasComponent implements OnInit {
    datosEstadisticas: any = null;
    cargando = false;
    errorMensaje: string | null = null;
  
    // EJEMPLO: configuración de un gráfico de barras
    public barChartType: 'bar' = 'bar';

    public barChartOptions: ChartOptions<'bar'> = {
      responsive: true
    };
    public barChartData: ChartData<'bar'> = {
      labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
      datasets: [
        { data: [5, 7, 3, 10, 8], label: 'Sesiones diarias' },
        { data: [3, 2.5, 1.8, 4, 4.2], label: 'Duración promedio (min)' }
      ]
    };


    constructor(private http: HttpClient) {} // inyectamos HttpClient
  
    ngOnInit(): void {
        

      
        this.cargando = true;
        const url = `${environment.apiUrl}/stats/estadisticas`;
        console.log('[DEBUG] Llamando a estadísticas en:', url);
        this.http.get(url, { withCredentials: true })
          .subscribe({
            next: (resp: any) => {
              console.log('[DEBUG] Respuesta del endpoint estadísticas:', resp);
              this.datosEstadisticas = {
                distribucionNiveles: resp.distribucionNiveles,
                tiemposPorNivel: resp.tiemposPorNivel
              };
              this.cargando = false;
            },
            error: (err) => {
              console.error('[ERROR] Error al cargar estadísticas:', err);
              this.cargando = false;
              this.errorMensaje = 'Error al cargar estadísticas';
            }
        });
    }
      
  

  cargarEstadisticas() {
    this.cargando = true;
    this.errorMensaje = null;
    // Ejemplo: Llamar a un servicio o endpoint que devuelva un objeto con la info
    // El backend podría tener un endpoint GET /api/stats/estadisticas
    // que devuelva algo como:
    // {
    //   distribucionNiveles: [ { level: 1, count: 10 }, { level: 2, count: 5 } ],
    //   tiemposPorNivel: [ { _id: 1, promedio: 12345, minimo: 5000, maximo: 30000 }, ... ]
    // }

    // Simulando la llamada:
    setTimeout(() => {
      // Simulación de datos
      this.datosEstadisticas = {
        distribucionNiveles: [
          { level: 1, count: 10 },
          { level: 2, count: 7 },
          { level: 3, count: 3 }
        ],
        tiemposPorNivel: [
          { _id: 1, promedio: 15000, minimo: 5000, maximo: 25000 },
          { _id: 2, promedio: 22000, minimo: 10000, maximo: 40000 }
        ]
      };
      this.cargando = false;
    }, 1500);
  }
}
