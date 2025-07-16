
export interface CheckInData {
  exerciseType: string;
  duration: number; // in minutes
  notes?: string;
}

export interface Settings {
  exerciseTypes: string[];
  weeklyGoal: number; // times per week
}
