import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Suppress Mapbox's import-time token validation error.
// The real token is set in the useEffect after validation.
try {
  if (!mapboxgl.accessToken) {
    mapboxgl.accessToken = 'pk.placeholder';
  }
} catch (_) {
  // ignore
}

interface MapViewProps {
  geojson: any;
  _selectedSiteId?: string | null;
  onSelectSite?: (siteId: string) => void;
  height?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
}

class MapErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn('Mapbox rendering exception caught safely by ErrorBoundary:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const MapViewInternal: React.FC<MapViewProps> = ({
  geojson,
  _selectedSiteId,
  onSelectSite,
  height = '500px',
  initialCenter = [20.0, 0.0],
  initialZoom = 2,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const navigate = useNavigate();

  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

  const [tokenError, setTokenError] = useState<boolean>(() => {
    if (!mapboxToken || typeof mapboxToken !== 'string') return true;
    const trimmed = mapboxToken.trim();
    return (
      trimmed === '' ||
      trimmed.includes('placeholder') ||
      trimmed.includes('example') ||
      !trimmed.startsWith('pk.')
    );
  });

  useEffect(() => {
    if (tokenError || !mapContainerRef.current) return;

    let activeMap: mapboxgl.Map | null = null;
    try {
      mapboxgl.accessToken = mapboxToken;

      activeMap = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: initialCenter,
        zoom: initialZoom,
      });

      activeMap.on('error', (e) => {
        console.warn('Mapbox GL error event caught:', e);
        setTokenError(true);
      });

      activeMap.addControl(new mapboxgl.NavigationControl(), 'top-right');
      mapRef.current = activeMap;

      activeMap.on('load', () => {
        if (!geojson || !geojson.features || geojson.features.length === 0) return;

        activeMap?.addSource('project-sites', {
          type: 'geojson',
          data: geojson,
        });

        activeMap?.addLayer({
          id: 'sites-fill',
          type: 'fill',
          source: 'project-sites',
          paint: {
            'fill-color': [
              'match',
              ['get', 'project_type'],
              'Carbon', '#10b981',
              'Biodiversity', '#14b8a6',
              'Mixed', '#6366f1',
              '#10b981'
            ],
            'fill-opacity': 0.45,
          },
        });

        activeMap?.addLayer({
          id: 'sites-outline',
          type: 'line',
          source: 'project-sites',
          paint: {
            'line-color': '#34d399',
            'line-width': 2,
          },
        });

        activeMap?.on('click', 'sites-fill', (e) => {
          if (!e.features || e.features.length === 0) return;

          const feature = e.features[0];
          const props = feature.properties || {};
          const siteId = props.id;

          if (onSelectSite) onSelectSite(siteId);

          const htmlContent = `
            <div style="font-family: sans-serif; max-width: 220px;">
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #34d399; letter-spacing: 0.05em;">
                ${props.project_type || 'Carbon Project'}
              </span>
              <h4 style="margin: 4px 0 2px 0; font-size: 14px; font-weight: 700; color: #ffffff;">
                ${props.name || 'Site'}
              </h4>
              <p style="margin: 0 0 8px 0; font-size: 11px; color: #94a3b8;">
                ${props.project_name || 'Project'} • ${props.area_hectares || 0} ha
              </p>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; background: #0b130e; padding: 6px 8px; border-radius: 6px; margin-bottom: 8px;">
                <div>
                  <div style="font-size: 9px; color: #64748b;">Carbon Stock</div>
                  <div style="font-size: 12px; font-weight: 700; color: #10b981;">${props.carbon_stock || 0} <span style="font-size: 9px;">t/ha</span></div>
                </div>
                <div>
                  <div style="font-size: 9px; color: #64748b;">Species Richness</div>
                  <div style="font-size: 12px; font-weight: 700; color: #38bdf8;">${props.species_richness || 0}</div>
                </div>
              </div>
              <button id="btn-view-site-${siteId}" style="width: 100%; background: #10b981; color: #ffffff; border: none; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer;">
                View Detailed Analytics
              </button>
            </div>
          `;

          if (activeMap) {
            new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(htmlContent)
              .addTo(activeMap);
          }

          setTimeout(() => {
            const btn = document.getElementById(`btn-view-site-${siteId}`);
            if (btn) {
              btn.addEventListener('click', () => {
                navigate(`/sites/${siteId}/analytics`);
              });
            }
          }, 100);
        });

        activeMap?.on('mouseenter', 'sites-fill', () => {
          if (activeMap) activeMap.getCanvas().style.cursor = 'pointer';
        });
        activeMap?.on('mouseleave', 'sites-fill', () => {
          if (activeMap) activeMap.getCanvas().style.cursor = '';
        });

        try {
          const bounds = new mapboxgl.LngLatBounds();
          geojson.features.forEach((feat: any) => {
            if (feat.geometry && feat.geometry.coordinates) {
              const coords = feat.geometry.coordinates[0];
              coords.forEach((coord: [number, number]) => {
                bounds.extend(coord);
              });
            }
          });
          if (!bounds.isEmpty() && activeMap) {
            activeMap.fitBounds(bounds, { padding: 40, maxZoom: 12 });
          }
        } catch (err) {
          console.warn('Could not fit bounds to geojson:', err);
        }
      });
    } catch (err) {
      console.warn('Mapbox initialization failed:', err);
      setTokenError(true);
    }

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          // Ignore unmount error
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geojson, mapboxToken, tokenError]);

  if (tokenError) {
    return (
      <div
        className="w-full bg-[#121f17] border border-[#1d3326] rounded-xl flex flex-col items-center justify-center p-8 text-center"
        style={{ height }}
      >
        <AlertTriangle className="w-10 h-10 text-amber-400 mb-3" />
        <h4 className="text-base font-bold text-white mb-1">Mapbox Token Required</h4>
        <p className="text-xs text-slate-400 max-w-md mb-4">
          Please add your valid <code className="text-emerald-400">VITE_MAPBOX_TOKEN</code> environment variable to your <code className="text-emerald-400">.env</code> file to enable live interactive GIS maps.
        </p>
        <div className="bg-[#0b130e] border border-[#1d3326] rounded-lg p-3 text-[11px] text-slate-300 font-mono text-left max-w-sm">
          VITE_MAPBOX_TOKEN=pk.eyJ1Ij...
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-[#1d3326] shadow-xl">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />
      <div className="absolute bottom-3 left-3 bg-[#121f17]/90 backdrop-blur-md border border-[#1d3326] px-3 py-1.5 rounded-lg text-[10px] text-slate-300 flex items-center gap-3 shadow-lg">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Carbon Project</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-teal-500"></span> Biodiversity</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-indigo-500"></span> Mixed</span>
      </div>
    </div>
  );
};

export const MapView: React.FC<MapViewProps> = (props) => {
  const fallback = (
    <div
      className="w-full bg-[#121f17] border border-[#1d3326] rounded-xl flex flex-col items-center justify-center p-8 text-center"
      style={{ height: props.height || '500px' }}
    >
      <AlertTriangle className="w-10 h-10 text-amber-400 mb-3" />
      <h4 className="text-base font-bold text-white mb-1">Mapbox Token Required</h4>
      <p className="text-xs text-slate-400 max-w-md mb-4">
        Please add your valid <code className="text-emerald-400">VITE_MAPBOX_TOKEN</code> environment variable to your <code className="text-emerald-400">.env</code> file to enable live interactive GIS maps.
      </p>
      <div className="bg-[#0b130e] border border-[#1d3326] rounded-lg p-3 text-[11px] text-slate-300 font-mono text-left max-w-sm">
        VITE_MAPBOX_TOKEN=pk.eyJ1Ij...
      </div>
    </div>
  );

  return (
    <MapErrorBoundary fallback={fallback}>
      <MapViewInternal {...props} />
    </MapErrorBoundary>
  );
};
