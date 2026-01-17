
export enum PersonaType {
  STUDENT = 'Student',
  WORKING_PROFESSIONAL = 'Working Professional',
  HOUSEHOLD_PLANNER = 'Household Planner'
}

export enum DietType {
  VEG = 'Veg',
  NON_VEG = 'Non-Veg',
  EGGITARIAN = 'Eggitarian'
}

export enum EffortTolerance {
  LOW = 'Low',
  MEDIUM = 'Medium',
  FLEXIBLE = 'Flexible'
}

export interface UserPreferences {
  persona: PersonaType;
  diet: DietType;
  dislikes: string;
  effort: EffortTolerance;
  pantry: string[];
  budget: string;
  cityType: string;
  reminderTime: 'morning' | 'evening';
  cookingWindow: string;
  reminderFrequency: '1' | '2';
}

export interface Meal {
  breakfast: string;
  lunch: string;
  dinner: string;
}

export interface MealPlanResponse {
  personaSummary: string;
  mealPlan: { day: number; meals: Meal }[];
  usingYourIngredients: string[];
  groceryList: { category: string; items: string[] }[];
  prepSchedule: string[];
  reminders: string[];
  substitutions: { meal: string; options: string[] }[];
  budgetFeasibility: {
    status: string;
    details: string;
    fallbacks?: { type: string; description: string }[];
  };
  personalisationProof: string;
}
