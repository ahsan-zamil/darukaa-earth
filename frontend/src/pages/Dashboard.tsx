import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DashboardSummary } from '../types';
import { StatCard } from '../components/ui/StatCard';
import { MapView } from '../components/map/MapView';
import { Badge } from '../components/ui/Badge';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  MapPin,
  Layers,
  TreeDeciduous,
  Bird,
  Activity,
  ArrowUpRight,
  Plus,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [geojson, setGeojson] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [sumRes, geoRes] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/geojson/all'),
        ]);
        setSummary(sumRes.data);
        setGeojson(geoRes.data);
      } catch (err) {
        console.error('Error loading dashboard summary:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-slate-800 rounded-lg"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-[#121f17] border border-[#1d3326] rounded-xl"></div>
          ))}
        </div>
        <div className="h-96 bg-[#121f17] border border-[#1d3326] rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Executive Dashboard</h2>
          <p className="text-xs text-slate-400 mt-1">
            Global carbon stock, biodiversity index, and PostGIS spatial intelligence
          </p>
        </div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/30 transition self-start"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </Link>
      </div>

      {/* 6 Top-Level KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Projects"
          value={summary?.total_projects || 0}
          icon={FolderKanban}
          color="emerald"
          subtitle="Registered Platform Projects"
        />
        <StatCard
          title="Active Projects"
          value={summary?.active_projects || 0}
          icon={Activity}
          color="emerald"
          change={12.5}
          trend="up"
        />
        <StatCard
          title="Total Sites"
          value={summary?.total_sites || 0}
          icon={MapPin}
          color="amber"
          subtitle="Mapped Spatial Polygons"
        />
        <StatCard
          title="Total Area"
          value={(summary?.total_area_hectares || 0).toLocaleString()}
          unit="ha"
          icon={Layers}
          color="blue"
          subtitle="Hectares Under Monitoring"
        />
        <StatCard
          title="Avg Carbon Stock"
          value={summary?.avg_carbon_stock || 0}
          unit="tCO₂e/ha"
          icon={TreeDeciduous}
          color="emerald"
          change={4.2}
          trend="up"
        />
        <StatCard
          title="Avg Species Index"
          value={summary?.avg_species_richness || 0}
          unit="species"
          icon={Bird}
          color="indigo"
          change={6.8}
          trend="up"
        />
      </div>

      {/* Geospatial Map Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-bold text-white tracking-tight">Global GIS Site Overview</h3>
          </div>
          <Link
            to="/map"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
          >
            <span>Expand Full Map</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {geojson && <MapView geojson={geojson} height="440px" />}
      </div>

      {/* Projects Grid & Activity Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Projects List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white tracking-tight">Recent Projects</h3>
            <Link to="/projects" className="text-xs font-medium text-slate-400 hover:text-white transition">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary?.recent_projects.map((proj) => (
              <div
                key={proj.id}
                className="bg-[#121f17] border border-[#1d3326] rounded-xl p-5 shadow-lg flex flex-col justify-between hover:border-[#2e523b] transition group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge label={proj.project_type} variant={proj.project_type.toLowerCase() as any} />
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">{proj.country}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition line-clamp-1">
                    {proj.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{proj.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1d3326] flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-4">
                    <span><strong>{proj.sites_count}</strong> Sites</span>
                    <span><strong>{proj.total_area_hectares}</strong> ha</span>
                  </div>
                  <Link
                    to={`/projects/${proj.id}`}
                    className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition"
                    title="View Project"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white tracking-tight">Recent Site Activity</h3>

          <div className="bg-[#121f17] border border-[#1d3326] rounded-xl p-5 shadow-lg space-y-4">
            {summary?.recent_activity.map((act) => (
              <div key={act.id} className="flex gap-3 text-xs">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">{act.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{act.subtitle}</div>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">
                    {new Date(act.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
