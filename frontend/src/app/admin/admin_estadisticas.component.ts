import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-admin-estadisticas',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, BaseChartDirective],
  providers: [
    provideCharts(withDefaultRegisterables())
  ],
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./admin.component.scss'],
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

      <!-- TABLA 2: Tiempo en Cada Nivel (aunque aquí la medida sigue en ms) -->
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

      <!-- GRÁFICO: Sesiones diarias y Duración promedio en segundos -->
      <div class="card mt-3">
        <div class="card-header">
          <h3>Sesiones diarias y duración promedio</h3>
        </div>
        <div class="card-body">
          <canvas
            baseChart
            [data]="barChartData"
            [options]="barChartOptions"
            [type]="barChartType"
          ></canvas>
        </div>
      </div>
      <!-- GRÁFICO: Proporción de usuarios nuevos vs recurrentes -->
      <div class="card mt-3">
        <div class="card-header">
          <h3>Proporción de usuarios nuevos vs recurrentes</h3>
        </div>
        <div class="card-body">
          <canvas
            baseChart
            [data]="pieChartData"
            [options]="pieChartOptions"
            [type]="pieChartType"
          ></canvas>
        </div>
      </div>
    </div>
  `
})
export class AdminEstadisticasComponent implements OnInit {
  datosEstadisticas: any = null;
  cargando = false;
  errorMensaje: string | null = null;
  
  // Configuración del gráfico: usamos el literal 'bar'
  public barChartType: 'bar' = 'bar';
  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true
  };
  // Inicialmente vacíos, se actualizarán con datos reales en segundos
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Sesiones diarias' },
      { data: [], label: 'Duración promedio (s)' }
    ]
  };

  //para grafico de usuarios nuevos vs recurrentes
  public pieChartType: 'pie' = 'pie';
  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      }
    }
  };
  public pieChartData: ChartData<'pie'> = {
    labels: ['Nuevos usuarios', 'Usuarios recurrentes'],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)']
      }
    ]
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
    this.cargarSesionesDiarias();
    this.cargarProporcionUsuarios();
  }
  
  private cargarEstadisticas(): void {
    this.cargando = true;
    const urlEstadisticas = `${environment.apiUrl}/stats/estadisticas`;
    
    this.http.get(urlEstadisticas, { withCredentials: true })
      .subscribe({
        next: (resp: any) => {
          this.datosEstadisticas = {
            distribucionNiveles: resp.distribucionNiveles,
            tiemposPorNivel: resp.tiemposPorNivel
          };
        },
        error: (err) => {
          console.error('[ERROR] Error al cargar estadísticas:', err);
          this.errorMensaje = 'Error al cargar estadísticas';
        }
      });
  }
  
  private cargarSesionesDiarias(): void {
    const urlSesionesDiarias = `${environment.apiUrl}/stats/sesiones-diarias`;
    
    this.http.get(urlSesionesDiarias, { withCredentials: true })
      .subscribe({
        next: (resp: any) => {
          if (resp.ok) {
            this.actualizarDatosGraficoBarras(resp.data);
          } else {
            this.errorMensaje = 'No se pudieron obtener las sesiones diarias.';
          }
          this.cargando = false;
        },
        error: (err) => {
          console.error('[ERROR] Error al obtener sesiones diarias:', err);
          this.errorMensaje = 'Error al obtener sesiones diarias.';
          this.cargando = false;
        }
      });
  }
  
  private actualizarDatosGraficoBarras(data: any[]): void {
    const labels = data.map((item: any) => item._id);
    const sesiones = data.map((item: any) => item.sesiones);
    const duracion = data.map((item: any) => item.duracionPromedio);
    
    this.barChartData = {
      labels,
      datasets: [
        { data: sesiones, label: 'Sesiones diarias' },
        { data: duracion, label: 'Duración promedio (s)' }
      ]
    };
  }
  
  private cargarProporcionUsuarios(): void {
    const urlProporcionUsuarios = `${environment.apiUrl}/stats/proporcion-usuarios`;
    
    this.http.get(urlProporcionUsuarios, { withCredentials: true })
      .subscribe({
        next: (resp: any) => {
          if (resp.ok) {
            this.actualizarDatosGraficoPie(resp.data);
          }
        },
        error: (err) => {
          console.error('[ERROR] Error al obtener proporción de usuarios:', err);
          this.errorMensaje = 'Error al obtener proporción de usuarios.';
        }
      });
  }
  
  private actualizarDatosGraficoPie(data: any): void {
    this.pieChartData = {
      labels: ['Nuevos usuarios', 'Usuarios recurrentes'],
      datasets: [
        {
          data: [data.porcentajeNuevos, data.porcentajeRecurrentes],
          backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)']
        }
      ]
    };
  }
}
