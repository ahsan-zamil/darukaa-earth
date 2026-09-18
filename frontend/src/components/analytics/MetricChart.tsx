import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { SiteMetric } from '../../types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MetricChartProps {
  metrics: SiteMetric[];
  metricKey: keyof SiteMetric;
  label: string;
  unit: string;
  color?: string;
  fillColor?: string;
  type?: 'line' | 'bar';
}

export const MetricChart: React.FC<MetricChartProps> = ({
  metrics,
  metricKey,
  label,
  unit,
  color = '#10b981',
  fillColor = 'rgba(16, 185, 129, 0.15)',
  type = 'line',
}) => {
  const sortedMetrics = [...metrics].sort(
    (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
  );

  const labels = sortedMetrics.map((m) => {
    const d = new Date(m.recorded_at);
    return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  });

  const dataValues = sortedMetrics.map((m) => Number(m[metricKey]) || 0);

  const chartData = {
    labels,
    datasets: [
      {
        label: `${label} (${unit})`,
        data: dataValues,
        borderColor: color,
        backgroundColor: type === 'line' ? fillColor : color,
        fill: type === 'line',
        tension: 0.35,
        pointBackgroundColor: color,
        pointBorderColor: '#0b130e',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#121f17',
        borderColor: '#1d3326',
        borderWidth: 1,
        titleColor: '#ffffff',
        bodyColor: '#34d399',
        bodyFont: { weight: 'bold' as const },
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (context: any) => `${label}: ${context.raw} ${unit}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(29, 51, 38, 0.5)',
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 11 },
        },
      },
      y: {
        grid: {
          color: 'rgba(29, 51, 38, 0.5)',
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 11 },
        },
      },
    },
  };

  return (
    <div className="bg-[#121f17] border border-[#1d3326] rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-white tracking-wide">{label}</h4>
          <p className="text-[11px] text-slate-400 font-medium">Historical performance over time</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#0b130e] border border-[#1d3326] text-emerald-400">
          {unit}
        </span>
      </div>

      <div className="h-56 w-full">
        {type === 'line' ? (
          <Line data={chartData} options={options} />
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>
    </div>
  );
};
