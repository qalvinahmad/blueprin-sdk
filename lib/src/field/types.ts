/**
 * @alvinahmad/blueprin-sdk - Field Inspection & Daily Log Types
 */

export interface FieldWeather {
  condition: 'cerah' | 'berawan' | 'hujan_ringan' | 'hujan_lebat' | 'badai';
  temperatureC?: number;
  impactOnWork: 'none' | 'partial_delay' | 'full_stoppage';
}

export interface FieldDailyLog {
  id: string;
  projectId: string;
  date: string; // YYYY-MM-DD
  weatherMorning: FieldWeather;
  weatherAfternoon: FieldWeather;
  workforceCount: number; // total workers on site
  workforceAttendance?: Record<string, number>; // e.g. { mandor: 1, tukang: 8, ladang: 4 }
  equipmentOnSite?: string[]; // e.g. ['Excavator 20T', 'Molen Semen 2 unit']
  completedActivities: string[];
  plannedNextActivities?: string[];
  photos?: string[];
  notes?: string;
  supervisorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionChecklistItem {
  id: string;
  category: 'K3_Safety' | 'Quality_Mutu' | 'Structural' | 'MEP' | 'Architectural';
  itemDescription: string;
  status: 'pass' | 'fail' | 'na' | 'rework_required';
  notes?: string;
  photoUrl?: string;
}

export interface FieldInspection {
  id: string;
  projectId: string;
  title: string;
  type: 'daily_k3' | 'pre_pour_concrete' | 'rebar_inspection' | 'scaffolding' | 'handover_punchlist';
  inspectorName: string;
  status: 'draft' | 'approved' | 'rejected' | 'pending_rework';
  scorePercent: number; // 0 - 100%
  items: InspectionChecklistItem[];
  locationGPS?: { latitude: number; longitude: number };
  signedAt?: string;
  createdAt: string;
  updatedAt: string;
}
