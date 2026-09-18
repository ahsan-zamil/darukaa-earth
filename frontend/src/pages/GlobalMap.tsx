import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { MapView } from '../components/map/MapView';
import { MapPin, Globe } from 'lucide-react';

export const GlobalMap: React.FC = () => {
  const [geojson, setGeojson] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchGeoJSON = async () => {
      try {
        const res = await api.get('/geojson/all');
        setGeojson(res.data);
      } catch (err) {
        console.error('Failed to load global map geojson:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGeoJSON();
  }, []);

  if (isLoading) {
    return (
      <div className="h-[75vh] w-full bg-[#121f17] border border-[#1d3326] rounded-xl flex items-center justify-center animate-pulse">
        <div className="text-xs text-slate-400">Loading PostGIS GIS Data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Globe className="w-6 h-6 text-emerald-400" />
            <span>Interactive Geospatial Platform</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Global PostGIS site polygons across Amazon, Congo, Sundarbans, and Western Ghats biomes
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#121f17] border border-[#1d3326] px-3.5 py-1.5 rounded-xl text-xs text-emerald-400 font-semibold">
          <MapPin className="w-4 h-4" />
          <span>{geojson?.features?.length || 0} Polygon Sites Active</span>
        </div>
      </div>

      {geojson && <MapView geojson={geojson} height="70vh" />}
    </div>
  );
};
