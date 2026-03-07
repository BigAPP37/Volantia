export interface RouteTemplate {
  id: string;
  user_id: string;
  name: string;
  start_time: string;
  end_time: string;
  break_minutes: number;
  service_type: string;
  scope: string;
  full_diets_national: number;
  half_diets_national: number;
  full_diets_international: number;
  half_diets_international: number;
  overnights: number;
  night_hours: number;
  half_night_hours: number;
  extra_hours: number;
  kilometers: number;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export type RouteTemplateInsert = Omit<RouteTemplate, 'id' | 'created_at' | 'updated_at'>;
