export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  project_type: 'Carbon' | 'Biodiversity' | 'Mixed';
  status: 'Active' | 'Draft' | 'Completed';
  country: string;
  owner_id: string;
  sites_count: number;
  total_area_hectares: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreateInput {
  name: string;
  description?: string;
  project_type: 'Carbon' | 'Biodiversity' | 'Mixed';
  status: 'Active' | 'Draft' | 'Completed';
  country: string;
}

export interface GeoJSONGeometry {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface Site {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  geometry: GeoJSONGeometry;
  area_hectares: number;
  created_at: string;
  updated_at: string;
}

export interface SiteCreateInput {
  name: string;
  description?: string;
  geometry: GeoJSONGeometry;
  area_hectares?: number;
}

export interface SiteMetric {
  id: string;
  site_id: string;
  recorded_at: string;
  carbon_stock: number;
  soil_organic_carbon: number;
  soil_ph: number;
  soil_moisture: number;
  species_richness: number;
  habitat_diversity: number;
  temperature: number;
  rainfall: number;
  pollution_index: number;
  deforestation_index: number;
  created_at: string;
}

export interface MetricTrend {
  current: number;
  previous: number;
  change_percent: number;
  trend: 'up' | 'down' | 'stable';
}

export interface SiteAnalyticsSummary {
  site_id: string;
  site_name: string;
  area_hectares: number;
  carbon_stock: MetricTrend;
  soil_organic_carbon: MetricTrend;
  species_richness: MetricTrend;
  soil_moisture: MetricTrend;
  rainfall: MetricTrend;
  habitat_diversity: MetricTrend;
  time_series: SiteMetric[];
}

export interface DashboardSummary {
  total_projects: number;
  active_projects: number;
  total_sites: number;
  total_area_hectares: number;
  avg_carbon_stock: number;
  avg_species_richness: number;
  recent_projects: Project[];
  recent_activity: {
    id: string;
    type: string;
    title: string;
    subtitle: string;
    timestamp: string;
  }[];
}
