
import { Settings } from './types';

export const DEFAULT_EXERCISE_TYPES: string[] = [
  '胸部 Chest',
  '背部 Back',
  '腿部 Legs',
  '跑步 Running',
  '其他 Others',
];

export const INITIAL_SETTINGS: Settings = {
  exerciseTypes: DEFAULT_EXERCISE_TYPES,
  weeklyGoal: 3,
};
