import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { StatsService } from '../services/stats.service';  // ← importa
import { map } from 'rxjs/operators';

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
      <h2>Estadísticas</h2>

      <div *ngIf="errorMensaje" class="alert alert-danger" role="alert">
        {{ errorMensaje }}
      </div>
      <div *ngIf="cargando" class="alert alert-info" role="alert">
        Cargando estadísticas...
      </div>

      <!-- GRÁFICOS EXISTENTES -->
      <div class="row chart-container mt-3">
        <!-- GRÁFICO: Sesiones diarias y Duración promedio (min) -->
        <div class="col-md-4">
          <div class="card">
            <div class="card-header">
              <h3>Sesiones diarias y duración promedio (min)</h3>
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
        </div>
        
        <!-- GRÁFICO: Proporción de usuarios nuevos vs recurrentes -->
        <div class="col-md-4">
          <div class="card">
            <div class="card-header">
              <h3>Usuarios nuevos vs recurrentes</h3>
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
        
        <!-- GRÁFICO: Horas pico de uso de la plataforma -->
        <div class="col-md-4">
          <div class="card">
            <div class="card-header">
              <h3>Horas pico de uso</h3>
            </div>
            <div class="card-body">
              <canvas
                baseChart
                [data]="lineChartData"
                [options]="lineChartOptions"
                [type]="lineChartType"
              ></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- NUEVAS GRÁFICAS -->
      <div class="row chart-container mt-3">
        <!-- GRÁFICO: Distribución de Usuarios por Nivel -->
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h3>Distribución de Usuarios por Nivel</h3>
            </div>
            <div class="card-body">
              <canvas
                baseChart
                [data]="barChartDistribucionData"
                [options]="barChartDistribucionOptions"
                [type]="barChartDistribucionType"
              ></canvas>
            </div>
          </div>
        </div>

        <!-- GRÁFICO: Tiempo en Cada Nivel (min) -->
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h3>Tiempo en Cada Nivel (min)</h3>
            </div>
            <div class="card-body">
              <canvas
                baseChart
                [data]="barChartTiempoData"
                [options]="barChartTiempoOptions"
                [type]="barChartTiempoType"
              ></canvas>
            </div>
          </div>
        </div>

      <div class="row chart-container mt-3">
        <!-- GRÁFICO: Exámenes (promedio aciertos/fallos) -->
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h3>Exámenes (promedio aciertos/fallos)</h3>
            </div>
            <div class="card-body">
              <canvas baseChart
                [data]="examChartData"
                [options]="examChartOptions"
                [type]="examChartType">
              </canvas>
            </div>
          </div>
        </div>

        <!-- GRÁFICO: Distribución de puntuaciones (0–5) -->
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h3>Distribución de puntuaciones (0–5)</h3>
            </div>
            <div class="card-body">
              <canvas
                baseChart
                [data]="barChartScoresData"
                [options]="barChartScoresOptions"
                [type]="barChartScoresType"
              ></canvas>
            </div>
          </div>
        </div>
        <div class="col-md-6 mt-4">
          <div class="card">
            <div class="card-header">
              <h3>Top 5 palabras más falladas</h3>
            </div>
            <div class="card-body" style="height:300px">
              <canvas
                baseChart
                [data]="barChartFailedData"
                [options]="barChartFailedOptions"
                [type]="barChartFailedType">
              </canvas>
            </div>
          </div>
        </div>
        <div class="col-md-12 mt-4">
        <div class="card">
          <div class="card-header"><h3>Evolución del rendimiento</h3></div>
          <div class="card-body" style="height:300px">
            <canvas
              baseChart
              [data]="perfChartData"
              [options]="perfChartOptions"
              [type]="perfChartType">
            </canvas>
          </div>
        </div>
      </div>
      </div>
      </div>
    </div>
  `
})
export class AdminEstadisticasComponent implements OnInit {
  datosEstadisticas: any = null;
  cargando = false;
  errorMensaje: string | null = null;
  
  // GRÁFICO: Sesiones diarias y Duración promedio
  public barChartType: 'bar' = 'bar';
  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 10 } } }
    }
  };
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Sesiones diarias' },
      { data: [], label: 'Duración promedio (min)' }
    ]
  };

  // GRÁFICO: Usuarios nuevos vs recurrentes (Pie)
  public pieChartType: 'pie' = 'pie';
  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 10 } } }
    }
  };
  public pieChartData: ChartData<'pie'> = {
    labels: ['Nuevos usuarios', 'Usuarios recurrentes'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)']
    }]
  };

  // GRÁFICO: Horas pico
  public lineChartType: 'line' = 'line';
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, ticks: { font: { size: 9 } } },
      x: { ticks: { font: { size: 9 } } }
    },
    plugins: {
      legend: { labels: { font: { size: 10 } } }
    }
  };
  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Sesiones por hora', borderColor: 'rgba(75, 192, 192, 1)', backgroundColor: 'rgba(75, 192, 192, 0.2)', tension: 0.1 }
    ]
  };

  // NUEVA GRÁFICA: Distribución de Usuarios por Nivel (Bar)
  public barChartDistribucionType: 'bar' = 'bar';
  public barChartDistribucionOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 10 } } }
    }
  };
  public barChartDistribucionData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Usuarios', backgroundColor: 'rgba(153, 102, 255, 0.6)' }
    ]
  };

  // NUEVA GRÁFICA: Tiempo en Cada Nivel (ms) (Bar)
  public barChartTiempoType: 'bar' = 'bar';
  public barChartTiempoOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 10 } } }
    }
  };
  public barChartTiempoData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Promedio', backgroundColor: 'rgba(75, 192, 192, 0.6)' },
      { data: [], label: 'Mínimo', backgroundColor: 'rgba(54, 162, 235, 0.6)' },
      { data: [], label: 'Máximo', backgroundColor: 'rgba(255, 99, 132, 0.6)' }
    ]
  };



  // Propiedades
  public examChartType: 'bar' = 'bar';
  public examChartOptions: ChartOptions<'bar'> = { /*…*/ };
  public examChartData: ChartData<'bar'> = {
    labels: ['Aciertos','Fallos'],
    datasets: [{ data: [], label: 'Promedio por sesión' }]
  };

  //Distribucion de puntuaciones
  public barChartScoresType: 'bar' = 'bar';
  public barChartScoresOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { title: { display: true, text: 'Aciertos (/5)' } },
      y: { beginAtZero: true, title: { display: true, text: 'Número de sesiones' } }
    },
    plugins: { legend: { display: false } }
  };
  public barChartScoresData: ChartData<'bar'> = {
    labels: [],       // e.g. ['0','1','2','3','4','5']
    datasets: [
      { data: [], label: 'Cantidad', backgroundColor: 'rgba(255, 159, 64, 0.6)' }
    ]
  };

  //5 palabras mas falladas
  public barChartFailedType: 'bar' = 'bar';
  public barChartFailedOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { title: { display: true, text: 'Palabra' } },
      y: { beginAtZero: true, title: { display: true, text: 'Veces fallada' } }
    },
    plugins: { legend: { display: false } }
  };
  public barChartFailedData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Fails' }
    ]
  };

  //para medir la evolucion a traves del tiempo
  public perfChartType: 'line' = 'line';
  public perfChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { title: { display: true, text: 'Fecha' } },
      y: {
        beginAtZero: true,
        max: 1,
        ticks: {
          callback: v => (v as number * 100).toFixed(0) + '%'
        },
        title: { display: true, text: 'Tasa de acierto (%)' }
      }
    },
    plugins: {
      legend: { labels: { font: { size: 10 } } }
    }
  };
  
  public perfChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Media aciertos (%)',
      fill: false,
      tension: 0.1
    }]
  };
  

  constructor(private http: HttpClient, private statsService: StatsService) {}

  ngOnInit(): void {
    // Cargar estadísticas que incluyen la distribución y los tiempos por nivel
    this.cargarEstadisticas();
    this.cargarSesionesDiarias();
    this.cargarProporcionUsuarios();
    this.cargarHorasPico();
    this.cargarExamStats();

    this.statsService.getScoreDistribution().subscribe(dist => {
      const labels = ['0','1','2','3','4','5'];
      const countsMap = new Map(dist.map(d => [d._id, d.count]));
      const data = labels.map((_, i) => countsMap.get(i) || 0);
  
      this.barChartScoresData = {
        labels,
        datasets: [{
          data,
          label: 'Cantidad',
          backgroundColor: 'rgba(255, 159, 64, 0.6)'
        }]
      };
    });

    this.statsService.getTopFailedWords() .subscribe(list => {
      const labels = list.map(w => w.palabra);
      const data   = list.map(w => w.fails);
      this.barChartFailedData = { labels, datasets: [{ data, label: 'Fails' }] };
    });


    //para medir la evolucion a traves del tiempo
    this.statsService.getPerformanceEvolution()
    .subscribe(series => {
      this.perfChartData = {
        labels: series.map(s => s._id),
        datasets: [{
          data: series.map(s => +s.avgCorrectRate.toFixed(4)), // e.g. [0.2, 0.6, …]
          label: 'Media aciertos (%)'
        }]
      };
    });


  }
  
  private cargarEstadisticas(): void {
    this.cargando = true;
    const urlEstadisticas = `${environment.apiUrl}/stats/estadisticas`;
    
    this.http.get(urlEstadisticas, { withCredentials: true })
      .subscribe({
        next: (resp: any) => {
          // Guardar datos en variable local (útil si se requieren en otro sitio)
          this.datosEstadisticas = {
            distribucionNiveles: resp.distribucionNiveles,
            tiemposPorNivel: resp.tiemposPorNivel
          };
          // Actualizar las gráficas nuevas con los datos obtenidos
          this.actualizarGraficoDistribucionUsuarios(resp.distribucionNiveles);
          this.actualizarGraficoTiemposPorNivel(resp.tiemposPorNivel);
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
    const duracionEnMinutos = data.map(item => item.duracionPromedio / 60).map(min => +min.toFixed(2)); // redondeamos a 2 decimales    

    this.barChartData = {
      labels,
      datasets: [
        { data: sesiones, label: 'Sesiones diarias' },
        { data: duracionEnMinutos, label: 'Duración promedio (s)' }
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

  private cargarHorasPico(): void {
    const urlHorasPico = `${environment.apiUrl}/stats/horas-pico`;
    
    this.http.get(urlHorasPico, { withCredentials: true })
      .subscribe({
        next: (resp: any) => {
          if (resp.ok) {
            this.actualizarDatosGraficoLinea(resp.data);
          } else {
            this.errorMensaje = 'No se pudieron obtener las horas pico.';
          }
        },
        error: (err) => {
          console.error('[ERROR] Error al obtener horas pico:', err);
          this.errorMensaje = 'Error al obtener horas pico.';
        }
      });
  }

  private cargarExamStats() {
    this.http.get(`${environment.apiUrl}/stats/examen-stats`, { withCredentials:true })
    .subscribe((resp:any) => {
        const d = resp.data;
        this.examChartData = {
          labels: ['Aciertos','Fallos'],
          datasets: [{ data: [d.avgCorrect, d.avgIncorrect], label: 'Promedio por sesión' }]
        };
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

  private actualizarDatosGraficoLinea(data: any[]): void {
    // Aseguramos tener todas las horas (0-23)
    const horasCompletas = Array.from({ length: 24 }, (_, i) => i);
    const etiquetasHoras = horasCompletas.map(hora => `${hora}:00`);

    const sesiones = Array(24).fill(0);
    data.forEach((item: any) => {
      const hora = item._id;
      sesiones[hora] = item.sesiones;
    });
    this.lineChartData = {
      labels: etiquetasHoras,
      datasets: [
        {
          data: sesiones,
          label: 'Sesiones por hora',
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1
        }
      ]
    };
  }

  // Método para actualizar el gráfico de distribución de usuarios por nivel
  private actualizarGraficoDistribucionUsuarios(data: any[]): void {
    const labels = data.map(item => item.level);
    const counts = data.map(item => item.count);
    this.barChartDistribucionData = {
      labels,
      datasets: [
        {
          data: counts,
          label: 'Usuarios',
          backgroundColor: 'rgba(153, 102, 255, 0.6)'
        }
      ]
    };
  }

  // Método para actualizar el gráfico de tiempos por nivel
  private actualizarGraficoTiemposPorNivel(data: any[]): void {
    const labels = data.map(item => item._id);
    const promediosMin = data.map(item => +(item.promedio / 60000).toFixed(2));
    const minimosMin   = data.map(item => +(item.minimo   / 60000).toFixed(2));
    const maximosMin   = data.map(item => +(item.maximo   / 60000).toFixed(2));

    this.barChartTiempoData = {
      labels,
      datasets: [
        { data: promediosMin, label: 'Promedio', backgroundColor: 'rgba(75, 192, 192, 0.6)' },
        { data: minimosMin, label: 'Mínimo', backgroundColor: 'rgba(54, 162, 235, 0.6)' },
        { data: maximosMin, label: 'Máximo', backgroundColor: 'rgba(255, 99, 132, 0.6)' }
      ]
    };
  }
}
