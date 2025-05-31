import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
  AfterViewInit,
  ElementRef,
  ViewChild,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {SalesTrendData} from '../../models/dashboard.model';
import {ThemeService} from '../../../../core/services/theme.service';
import {toObservable} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-sales-trend',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales-trend.component.html',
  styles: []
})
export class SalesTrendComponent implements OnChanges, AfterViewInit {
  @Input() salesData: SalesTrendData[] = [];
  @Input() isLoading = false;
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: any = null;
  private themeService = inject(ThemeService);

  constructor() {
    effect(() => {
      const theme = this.themeService.theme();

      if (this.chart) {
        setTimeout(() => {
          this.renderChart();
        }, 0);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['salesData'] && !changes['salesData'].firstChange) {
      this.renderChart();
    }
  }

  ngAfterViewInit(): void {
    if (this.salesData.length > 0) {
      setTimeout(() => {
        this.renderChart();
      }, 0);
    }
  }

  onPeriodChange(event: Event): void {
    const period = (event.target as HTMLSelectElement).value;
    console.log('Period changed to:', period);
    // In a real app, we would fetch new data for the selected period
  }

  private renderChart(): void {
    if (!this.chartCanvas || this.salesData.length === 0) {
      return;
    }

    const canvas = this.chartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    // Destroy existing chart if it exists
    if (this.chart) {
      this.chart.destroy();
    }

    // Import Chart.js dynamically to avoid SSR issues
    import('chart.js').then((ChartModule) => {
      const Chart = ChartModule.Chart;

      // Register required components
      Chart.register(
        ChartModule.CategoryScale,
        ChartModule.LineController,
        ChartModule.LineElement,
        ChartModule.PointElement,
        ChartModule.LinearScale,
        ChartModule.Tooltip,
        ChartModule.Legend
      );

      // Format dates
      const labels = this.salesData.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });

      // Get sales and orders data
      const salesValues = this.salesData.map(item => item.sales / 1000); // Convert to thousands
      const ordersValues = this.salesData.map(item => item.orders);

      // Determine colors based on theme
      const isDarkMode = this.themeService.theme() === 'dark';
      const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
      const textColor = isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';

      // Create the chart
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Sales (k)',
              data: salesValues,
              borderColor: '#22c55e', // primary-500
              backgroundColor: 'rgba(34, 197, 94, 0.2)',
              borderWidth: 2,
              tension: 0.3,
              pointRadius: 3,
              pointBackgroundColor: '#22c55e',
              yAxisID: 'y'
            },
            {
              label: 'Orders',
              data: ordersValues,
              borderColor: '#3b82f6', // blue-500
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              borderWidth: 2,
              tension: 0.3,
              pointRadius: 3,
              pointBackgroundColor: '#3b82f6',
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          scales: {
            x: {
              grid: {
                color: gridColor
              },
              ticks: {
                color: textColor
              }
            },
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: 'Sales (k UGX)',
                color: textColor
              },
              grid: {
                color: gridColor
              },
              ticks: {
                color: textColor
              }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: 'Orders',
                color: textColor
              },
              grid: {
                drawOnChartArea: false
              },
              ticks: {
                color: textColor
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: isDarkMode ? '#1f2937' : 'white',
              titleColor: isDarkMode ? '#f9fafb' : '#111827',
              bodyColor: isDarkMode ? '#d1d5db' : '#4b5563',
              borderColor: isDarkMode ? '#374151' : '#e5e7eb',
              borderWidth: 1,
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.datasetIndex === 0) {
                    label += new Intl.NumberFormat('en-UG', {
                      style: 'currency',
                      currency: 'UGX',
                      maximumFractionDigits: 0
                    }).format(context.raw as number * 1000);
                  } else {
                    label += context.raw;
                  }
                  return label;
                }
              }
            }
          }
        }
      });
    });
  }
}
