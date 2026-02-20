export interface User {
  id: number;
  email: string;
  fullName: string;
  username: string;
}

export interface Hospital {
  id: number;
  name: string;
  location: string;
  code: string;
  role?: string;
}

export interface Patient {
  id: number;
  hospital_id: number;
  full_name: string;
  age: number;
  gender: string;
  condition: string;
  status: 'Stable' | 'Critical' | 'Recovering';
}

export interface HospitalStats {
  patients: number;
  critical: number;
  appointments: number;
  staff: number;
}
