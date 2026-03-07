export type MarkerType = 'rest' | 'vacation' | 'sick_leave' | 'trip';

export interface DayMarker {
  id: string;
  user_id: string;
  date: string;
  marker_type: MarkerType;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const MARKER_TYPES: { value: MarkerType; label: string; color: string; bgColor: string }[] = [
  { value: 'rest', label: 'Descanso', color: 'text-slate-400', bgColor: 'bg-slate-500/20' },
  { value: 'vacation', label: 'Vacaciones', color: 'text-sky-400', bgColor: 'bg-sky-500/20' },
  { value: 'sick_leave', label: 'Baja médica', color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
  { value: 'trip', label: 'Viaje', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
];

export const getMarkerConfig = (type: MarkerType) => {
  return MARKER_TYPES.find(m => m.value === type) || MARKER_TYPES[0];
};
