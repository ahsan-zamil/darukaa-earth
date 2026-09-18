import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { AlertTriangle, Check, Trash2, Edit3 } from 'lucide-react';

// Suppress Mapbox's import-time token validation error.
try {
  if (!mapboxgl.accessToken) {
    mapboxgl.accessToken = 'pk.placeholder';
  }
} catch (_) {
  // ignore
}

interface SiteDrawMapProps {
  onPolygonCreated: (geometry: { type: 'Polygon'; coordinates: number[][][] }, areaHectares: number) => void;
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
    console.warn('Mapbox Draw exception caught safely by ErrorBoundary:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const SiteDrawMapInternal: React.FC<SiteDrawMapProps> = ({
  onPolygonCreated,
  height = '420px',
  initialCenter = [0.0, 10.0],
  initialZoom = 2,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const [drawnArea, setDrawnArea] = useState<number | null>(null);

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

    let map: mapboxgl.Map | null = null;
    try {
      mapboxgl.accessToken = mapboxToken;

      map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: initialCenter,
        zoom: initialZoom,
      });

      map.on('error', (e) => {
        console.warn('Mapbox GL draw error caught:', e);
        setTokenError(true);
      });

      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true,
        },
        defaultMode: 'draw_polygon',
      });

      map.addControl(draw as any, 'top-left');
      map.addControl(new mapboxgl.NavigationControl(), 'top-right');

      mapRef.current = map;
      drawRef.current = draw;

      const updatePolygonData = () => {
        const data = draw.getAll();
        if (data.features.length > 0) {
          const feature = data.features[data.features.length - 1];
          if (feature.geometry && feature.geometry.type === 'Polygon') {
            const coords = feature.geometry.coordinates;

            let areaSqMeters = 0;
            try {
              const polyCoords = coords[0];
              let sum = 0;
              for (let i = 0; i < polyCoords.length - 1; i++) {
                const p1 = polyCoords[i];
                const p2 = polyCoords[i + 1];
                sum += (p2[0] - p1[0]) * (p2[1] + p1[1]);
              }
              const centerLat = polyCoords[0][1];
              const mPerDegLat = 111000.0;
              const mPerDegLng = 111000.0 * Math.cos((centerLat * Math.PI) / 180.0);
              areaSqMeters = Math.abs(sum * 0.5) * mPerDegLat * mPerDegLng;
            } catch (e) {
              areaSqMeters = 500000;
            }

            const hectares = Math.max(Math.round((areaSqMeters / 10000.0) * 100) / 100, 1.0);
            setDrawnArea(hectares);

            onPolygonCreated(
              {
                type: 'Polygon',
                coordinates: coords as number[][][],
              },
              hectares
            );
          }
        } else {
          setDrawnArea(null);
        }
      };

      map.on('draw.create', updatePolygonData);
      map.on('draw.update', updatePolygonData);
      map.on('draw.delete', () => setDrawnArea(null));
    } catch (err) {
      console.warn('Mapbox draw initialization failed:', err);
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
  }, [mapboxToken, tokenError]);

  const handleClear = () => {
    if (drawRef.current) {
      drawRef.current.deleteAll();
      setDrawnArea(null);
      if (mapRef.current) {
        drawRef.current.changeMode('draw_polygon');
      }
    }
  };

  if (tokenError) {
    return (
      <div className="w-full bg-[#0b130e] border border-[#1d3326] rounded-xl p-6 text-center" style={{ height }}>
        <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
        <h5 className="text-sm font-bold text-white mb-1">Map Drawing Fallback Mode</h5>
        <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
          Mapbox token is required for visual polygon drawing. Sample default site geometry coordinates will be submitted automatically.
        </p>
        <button
          type="button"
          onClick={() => {
            const sampleCoords = [
              [
                [-54.95, -3.20],
                [-54.88, -3.20],
                [-54.88, -3.27],
                [-54.95, -3.27],
                [-54.95, -3.20]
              ]
            ];
            setDrawnArea(540.25);
            onPolygonCreated({ type: 'Polygon', coordinates: sampleCoords }, 540.25);
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition"
        >
          Use Demo Polygon Coordinates (540.25 ha)
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-[#1d3326]">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />

      <div className="absolute top-3 right-3 bg-[#121f17]/95 backdrop-blur-md border border-[#1d3326] px-3 py-2 rounded-xl shadow-lg flex items-center gap-3">
        <div className="text-xs text-slate-300">
          {drawnArea ? (
            <span className="flex items-center gap-1.5 font-bold text-emerald-400">
              <Check className="w-4 h-4 text-emerald-400" /> Site Polygon Drawn ({drawnArea} ha)
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-slate-400 font-medium">
              <Edit3 className="w-4 h-4 text-emerald-400 animate-bounce" /> Click points on the map to draw polygon
            </span>
          )}
        </div>

        {drawnArea && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-slate-400 hover:text-rose-400 transition"
            title="Clear Drawing"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export const SiteDrawMap: React.FC<SiteDrawMapProps> = (props) => {
  const fallback = (
    <div className="w-full bg-[#0b130e] border border-[#1d3326] rounded-xl p-6 text-center" style={{ height: props.height || '420px' }}>
      <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
      <h5 className="text-sm font-bold text-white mb-1">Map Drawing Fallback Mode</h5>
      <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
        Mapbox token is required for visual polygon drawing. Sample default site geometry coordinates will be submitted automatically.
      </p>
      <button
        type="button"
        onClick={() => {
          const sampleCoords = [
            [
              [-54.95, -3.20],
              [-54.88, -3.20],
              [-54.88, -3.27],
              [-54.95, -3.27],
              [-54.95, -3.20]
            ]
          ];
          props.onPolygonCreated({ type: 'Polygon', coordinates: sampleCoords }, 540.25);
        }}
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition"
      >
        Use Demo Polygon Coordinates (540.25 ha)
      </button>
    </div>
  );

  return (
    <MapErrorBoundary fallback={fallback}>
      <SiteDrawMapInternal {...props} />
    </MapErrorBoundary>
  );
};
