import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Project, ProjectCreateInput } from '../types';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Trash2,
  ArrowRight,
  Globe,
  MapPin,
  AlertTriangle,
} from 'lucide-react';

export const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  // Form State
  const [formData, setFormData] = useState<ProjectCreateInput>({
    name: '',
    description: '',
    project_type: 'Carbon',
    status: 'Active',
    country: 'Global',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (typeFilter) params.project_type = typeFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/projects', { params });
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, typeFilter, statusFilter]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      await api.post('/projects', formData);
      setIsCreateOpen(false);
      setFormData({
        name: '',
        description: '',
        project_type: 'Carbon',
        status: 'Active',
        country: 'Global',
      });
      fetchProjects();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to create project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/projects/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchProjects();
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Environmental Projects</h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage carbon sequestration initiatives, biodiversity reserves, and spatial project sites
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/30 transition self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Create Project</span>
        </button>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-[#121f17] border border-[#1d3326] rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-lg">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search project name or description..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#0b130e] border border-[#1d3326] rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#0b130e] border border-[#1d3326] text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Types</option>
            <option value="Carbon">Carbon</option>
            <option value="Biodiversity">Biodiversity</option>
            <option value="Mixed">Mixed</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0b130e] border border-[#1d3326] text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 bg-[#121f17] border border-[#1d3326] rounded-xl"></div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-[#121f17] border border-[#1d3326] rounded-xl p-12 text-center space-y-3">
          <FolderKanban className="w-10 h-10 text-slate-500 mx-auto" />
          <h4 className="text-base font-bold text-white">No Projects Found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            There are no projects matching your search criteria. Create a new carbon or biodiversity project to begin.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-[#121f17] border border-[#1d3326] rounded-xl p-6 shadow-xl flex flex-col justify-between hover:border-[#2e523b] transition group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge label={project.project_type} variant={project.project_type.toLowerCase() as any} />
                    <Badge label={project.status} variant={project.status.toLowerCase() as any} />
                  </div>
                  <button
                    onClick={() => setDeleteTarget(project)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition mb-2">
                  {project.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                  {project.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-4 border-t border-[#1d3326] space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" /> {project.country}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" /> <strong>{project.sites_count}</strong> Sites
                    </span>
                    <span><strong>{project.total_area_hectares}</strong> ha</span>
                  </div>
                </div>

                <Link
                  to={`/projects/${project.id}`}
                  className="w-full py-2 bg-[#0b130e] hover:bg-emerald-600/15 border border-[#1d3326] hover:border-emerald-500/40 text-emerald-400 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  <span>View Project & Sites</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Environmental Project">
        {formError && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {formError}
          </div>
        )}

        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Project Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-[#0b130e] border border-[#1d3326] rounded-lg text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
              placeholder="e.g. Amazonian Rainforest Regeneration"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-[#0b130e] border border-[#1d3326] rounded-lg text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
              placeholder="Detailed objectives and environmental baseline scope..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Project Type</label>
              <select
                value={formData.project_type}
                onChange={(e) => setFormData({ ...formData, project_type: e.target.value as any })}
                className="w-full px-3 py-2 bg-[#0b130e] border border-[#1d3326] rounded-lg text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="Carbon">Carbon</option>
                <option value="Biodiversity">Biodiversity</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 bg-[#0b130e] border border-[#1d3326] rounded-lg text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Country / Region</label>
            <input
              type="text"
              required
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full px-3 py-2 bg-[#0b130e] border border-[#1d3326] rounded-lg text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
              placeholder="e.g. Brazil"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#1d3326]">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Save Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Project Deletion"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="text-xs">
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? All associated geographical sites and metrics will be deleted.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow-lg"
            >
              Delete Permanently
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
