import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { SiteAnalyticsSummary } from '../types';
import { StatCard } from '../components/ui/StatCard';
import { MetricChart } from '../components/analytics/MetricChart';
import {
  ArrowLeft,
  TreeDeciduous,
  Sprout,
  Bird,
  Droplets,
  CloudRain,
  Activity,
  Info,
  Layers,
} from 'lucide-react';

export const SiteAnalytics: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [analytics, setAnalytics] = useState<SiteAnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const res = await api.get(`/sites/${id}/analytics`);
        setAnalytics(res.data);
      } catch (err) {
        console.error('Failed to load site analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-slate-800 rounded"></div>
        <div className="h-28 bg-[#121f17] border border-[#1d3326] rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-[#121f17] rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-bold text-white">Site Analytics Unavailable</h3>
        <Link to="/projects" className="text-xs text-emerald-400 mt-2 inline-block">
          Return to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Navigation & Header */}
      <div className="space-y-2">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Activity className="w-6 h-6 text-emerald-400" />
              <span>{analytics.site_name} – Environmental Analytics</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>Site Area: <strong className="text-slate-200">{analytics.area_hectares} ha</strong></span>
              <span>•</span>
              <span className="text-emerald-400 font-mono">PostGIS Polygon Record</span>
            </p>
          </div>

          <div className="bg-[#121f17] border border-[#1d3326] px-3.5 py-1.5 rounded-xl text-xs text-slate-300 flex items-center gap-2">
            <Info className="w-4 h-4 text-teal-400" />
            <span>Demonstration & Synthetic Analytics Data</span>
          </div>
        </div>
      </div>

      {/* 6 Summary Performance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Carbon Stock"
          value={analytics.carbon_stock.current}
          unit="tCO₂e/ha"
          icon={TreeDeciduous}
          color="emerald"
          change={analytics.carbon_stock.change_percent}
          trend={analytics.carbon_stock.trend}
          subtitle={`Prev: ${analytics.carbon_stock.previous}`}
        />
        <StatCard
          title="Soil Organic Carbon (SOC)"
          value={analytics.soil_organic_carbon.current}
          unit="%"
          icon={Sprout}
          color="emerald"
          change={analytics.soil_organic_carbon.change_percent}
          trend={analytics.soil_organic_carbon.trend}
          subtitle={`Prev: ${analytics.soil_organic_carbon.previous}`}
        />
        <StatCard
          title="Species Richness"
          value={analytics.species_richness.current}
          unit="species"
          icon={Bird}
          color="indigo"
          change={analytics.species_richness.change_percent}
          trend={analytics.species_richness.trend}
          subtitle={`Prev: ${analytics.species_richness.previous}`}
        />
        <StatCard
          title="Habitat Diversity Index"
          value={analytics.habitat_diversity.current}
          unit="Shannon H'"
          icon={Layers}
          color="blue"
          change={analytics.habitat_diversity.change_percent}
          trend={analytics.habitat_diversity.trend}
          subtitle={`Prev: ${analytics.habitat_diversity.previous}`}
        />
        <StatCard
          title="Soil Moisture"
          value={analytics.soil_moisture.current}
          unit="%"
          icon={Droplets}
          color="blue"
          change={analytics.soil_moisture.change_percent}
          trend={analytics.soil_moisture.trend}
          subtitle={`Prev: ${analytics.soil_moisture.previous}`}
        />
        <StatCard
          title="Monthly Rainfall"
          value={analytics.rainfall.current}
          unit="mm"
          icon={CloudRain}
          color="amber"
          change={analytics.rainfall.change_percent}
          trend={analytics.rainfall.trend}
          subtitle={`Prev: ${analytics.rainfall.previous}`}
        />
      </div>

      {/* Chart.js Time Series Visualizations */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight">Time-Series Performance Metrics</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MetricChart
            metrics={analytics.time_series}
            metricKey="carbon_stock"
            label="Carbon Stock Sequestration"
            unit="tCO₂e/ha"
            color="#10b981"
            fillColor="rgba(16, 185, 129, 0.15)"
          />

          <MetricChart
            metrics={analytics.time_series}
            metricKey="soil_organic_carbon"
            label="Soil Organic Carbon (SOC)"
            unit="%"
            color="#14b8a6"
            fillColor="rgba(20, 184, 166, 0.15)"
          />

          <MetricChart
            metrics={analytics.time_series}
            metricKey="species_richness"
            label="Biodiversity & Species Richness"
            unit="species count"
            color="#6366f1"
            fillColor="rgba(99, 102, 241, 0.15)"
            type="bar"
          />

          <MetricChart
            metrics={analytics.time_series}
            metricKey="soil_moisture"
            label="Soil Moisture Content"
            unit="%"
            color="#38bdf8"
            fillColor="rgba(56, 189, 248, 0.15)"
          />
        </div>
      </div>
    </div>
  );
};
