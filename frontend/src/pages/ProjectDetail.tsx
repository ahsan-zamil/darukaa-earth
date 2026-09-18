import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Project, Site } from '../types';
import { Badge } from '../components/ui/Badge';
import { MapView } from '../components/map/MapView';
import { SiteDrawMap } from '../components/map/SiteDrawMap';
import { Modal } from '../components/ui/Modal';
import {
  ArrowLeft,
  MapPin,
  Layers,
  Plus,
  Globe,
  Trash2,
  BarChart3,
  CheckCircle2,
  Info,
} from 'lucide-react';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [project, setProject] = useState<Project | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Add Site Modal & Drawing State
  const [isAddSiteOpen, setIsAddSiteOpen] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [drawnGeometry, setDrawnGeometry] = useState<any>(null);
  const [drawnArea, setDrawnArea] = useState<number>(0);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadProjectData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [pRes, sRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/sites`),
      ]);
      setProject(pRes.data);
      setSites(sRes.data);
    } catch (err) {
      console.error('Failed to load project details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handlePolygonCreated = (geometry: any, areaHectares: number) => {
    setDrawnGeometry(geometry);
    setDrawnArea(areaHectares);
  };

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!drawnGeometry) {
      setFormError('Please draw a polygon on the map before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/projects/${id}/sites`, {
        name: siteName,
        description: siteDescription,
        geometry: drawnGeometry,
        area_hectares: drawnArea,
      });

      setIsAddSiteOpen(false);
      setSiteName('');
      setSiteDescription('');
      setDrawnGeometry(null);
      setDrawnArea(0);

      // Reload project and sites immediately
      loadProjectData();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to create site.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSite = async (siteId: string) => {
    if (!window.confirm('Are you sure you want to delete this site?')) return;
    try {
      await api.delete(`/sites/${siteId}`);
      loadProjectData();
    } catch (err) {
      console.error('Failed to delete site:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-slate-800 rounded"></div>
        <div className="h-40 bg-[#121f17] border border-[#1d3326] rounded-xl"></div>
        <div className="h-96 bg-[#121f17] border border-[#1d3326] rounded-xl"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-bold text-white">Project Not Found</h3>
        <Link to="/projects" className="text-xs text-emerald-400 mt-2 inline-block">
          Return to Projects
        </Link>
      </div>
    );
  }

  // Build GeoJSON FeatureCollection for MapView
  const projectGeoJSON = {
    type: 'FeatureCollection',
    features: sites.map((s) => ({
      type: 'Feature',
      id: s.id,
      geometry: s.geometry,
      properties: {
        id: s.id,
        name: s.name,
        project_name: project.name,
        project_type: project.project_type,
        area_hectares: s.area_hectares,
        carbon_stock: 145.2,
        species_richness: 110,
      },
    })),
  };

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link
        to="/projects"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Projects</span>
      </Link>

      {/* Project Header Banner */}
      <div className="bg-[#121f17] border border-[#1d3326] rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <Badge label={project.project_type} variant={project.project_type.toLowerCase() as any} />
              <Badge label={project.status} variant={project.status.toLowerCase() as any} />
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-emerald-400" /> {project.country}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">{project.name}</h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              {project.description || 'No detailed description provided for this project.'}
            </p>
          </div>

          <button
            onClick={() => setIsAddSiteOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xl shadow-emerald-900/40 transition shrink-0 self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Add Spatial Site</span>
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-8 pt-6 border-t border-[#1d3326] grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Sites</div>
            <div className="text-xl font-bold text-white mt-1 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" /> {sites.length}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Area</div>
            <div className="text-xl font-bold text-white mt-1 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-400" /> {project.total_area_hectares} ha
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Created Date</div>
            <div className="text-xs font-semibold text-slate-300 mt-1 font-mono">
              {new Date(project.created_at).toLocaleDateString()}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</div>
            <div className="text-xs font-semibold text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> PostGIS Monitored
            </div>
          </div>
        </div>
      </div>

      {/* Geospatial Map View */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <span>Project Site Polygons</span>
        </h3>
        <MapView geojson={projectGeoJSON} height="400px" />
      </div>

      {/* Site List Table */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight">Geographical Sites ({sites.length})</h3>

        {sites.length === 0 ? (
          <div className="bg-[#121f17] border border-[#1d3326] rounded-xl p-8 text-center space-y-3">
            <Info className="w-8 h-8 text-slate-500 mx-auto" />
            <h4 className="text-sm font-bold text-white">No Sites Added Yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Click "Add Spatial Site" to draw a site polygon on the interactive map and store it in PostGIS.
            </p>
          </div>
        ) : (
          <div className="bg-[#121f17] border border-[#1d3326] rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0e1913] text-slate-400 font-semibold uppercase tracking-wider border-b border-[#1d3326]">
                  <tr>
                    <th className="px-6 py-3.5">Site Name</th>
                    <th className="px-6 py-3.5">Description</th>
                    <th className="px-6 py-3.5">Area (ha)</th>
                    <th className="px-6 py-3.5">Created</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1d3326]">
                  {sites.map((site) => (
                    <tr key={site.id} className="hover:bg-[#16271e] transition">
                      <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        {site.name}
                      </td>
                      <td className="px-6 py-4 text-slate-400 max-w-xs truncate">
                        {site.description || 'No notes'}
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-emerald-300">
                        {site.area_hectares} ha
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-mono">
                        {new Date(site.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Link
                          to={`/sites/${site.id}/analytics`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition font-semibold"
                        >
                          <BarChart3 className="w-3.5 h-3.5" />
                          <span>Analytics</span>
                        </Link>
                        <button
                          onClick={() => handleDeleteSite(site.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          title="Delete Site"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Site Modal (Mapbox Polygon Drawing) */}
      <Modal
        isOpen={isAddSiteOpen}
        onClose={() => setIsAddSiteOpen(false)}
        title="Draw & Add New Geographical Site"
        maxWidth="2xl"
      >
        {formError && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {formError}
          </div>
        )}

        <form onSubmit={handleCreateSite} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Site Name *</label>
              <input
                type="text"
                required
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3 py-2 bg-[#0b130e] border border-[#1d3326] rounded-lg text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                placeholder="e.g. North Canopy Conservation Sector"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
              <input
                type="text"
                value={siteDescription}
                onChange={(e) => setSiteDescription(e.target.value)}
                className="w-full px-3 py-2 bg-[#0b130e] border border-[#1d3326] rounded-lg text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                placeholder="e.g. High-density mangrove canopy zone"
              />
            </div>
          </div>

          {/* Interactive Map Drawing Component */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Draw Site Polygon on Map *
            </label>
            <SiteDrawMap onPolygonCreated={handlePolygonCreated} height="360px" />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-[#1d3326]">
            <div className="text-xs text-slate-400 font-mono">
              Calculated Area: <span className="text-emerald-400 font-bold">{drawnArea} ha</span>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsAddSiteOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !drawnGeometry}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? 'Saving to PostGIS...' : 'Save Spatial Site'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
