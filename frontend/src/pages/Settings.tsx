import React from 'react';
import { useAuth } from '../context/useAuth';
import { Settings as SettingsIcon, ShieldCheck, Database } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-emerald-400" />
          <span>Platform Settings & System Architecture</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          System configuration, authentication state, and spatial database runtime
        </p>
      </div>

      <div className="bg-[#121f17] border border-[#1d3326] rounded-xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Current Authenticated Profile
        </h3>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400">Full Name</span>
            <div className="font-semibold text-white mt-1">{user?.name}</div>
          </div>
          <div>
            <span className="text-slate-400">Email Address</span>
            <div className="font-semibold text-white mt-1">{user?.email}</div>
          </div>
          <div>
            <span className="text-slate-400">Role</span>
            <div className="font-semibold text-emerald-400 mt-1 uppercase">{user?.role}</div>
          </div>
          <div>
            <span className="text-slate-400">Session Type</span>
            <div className="font-semibold text-slate-300 mt-1">JWT Bearer Token</div>
          </div>
        </div>
      </div>

      <div className="bg-[#121f17] border border-[#1d3326] rounded-xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-teal-400" /> PostGIS Spatial Engine
        </h3>
        <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
          <p>
            Spatial polygon site boundaries are converted dynamically between standard WGS84 GeoJSON (<code className="text-emerald-400">EPSG:4326</code>) and PostGIS geometry layers using <code className="text-emerald-400">ST_AsGeoJSON</code> and <code className="text-emerald-400">ST_GeomFromGeoJSON</code>.
          </p>
          <div className="p-3 bg-[#0b130e] border border-[#1d3326] rounded-lg font-mono text-[11px] text-emerald-400">
            PostGIS Version: 3.4 / PostgreSQL 16 (SRID 4326 POLYGON)
          </div>
        </div>
      </div>
    </div>
  );
};
