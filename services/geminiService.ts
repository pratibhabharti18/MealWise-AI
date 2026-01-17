
import { GoogleGenAI, Type } from "@google/genai";
import { UserPreferences } from "../types";

export const generateMealPlan = async (prefs: UserPreferences) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Act as a production-grade AI meal planning assistant.
    User Preferences:
    - Persona: ${prefs.persona}
    - Diet: ${prefs.diet}
    - Dislikes/Intolerances: ${prefs.dislikes || 'None'}
    - Effort Tolerance: ${prefs.effort}
    - Pantry Ingredients: ${prefs.pantry.join(', ')}
    - Daily Budget: ${prefs.budget}
    - City Type: ${prefs.cityType}
    - Reminder Preference: ${prefs.reminderTime}
    - Cooking Window: ${prefs.cookingWindow}
    - Reminder Frequency: ${prefs.reminderFrequency}

    Rules:
    1. Realistic Indian meals only.
    2. Ingredient Lock: Use at least 3 pantry ingredients per day.
    3. 1-3 day plan (generate 3 days).
    4. Time and effort awareness based on persona.
    5. No emojis.
    6. Strict output structure as per requirement.
    7. Validation: Check if the budget of ${prefs.budget} is feasible for the city type ${prefs.cityType}.

    Return the response strictly in JSON format matching this schema:
    {
      "personaSummary": "string",
      "mealPlan": [{"day": number, "meals": {"breakfast": "string", "lunch": "string", "dinner": "string"}}],
      "usingYourIngredients": ["list of items used and how"],
      "groceryList": [{"category": "string", "items": ["string"]}],
      "prepSchedule": ["step by step"],
      "reminders": ["scheduled reminders based on preference"],
      "substitutions": [{"meal": "string", "options": ["string", "string"]}],
      "budgetFeasibility": {
        "status": "feasible/infeasible",
        "details": "string",
        "fallbacks": [{"type": "string", "description": "string"}] // Exactly 2 if infeasible
      },
      "personalisationProof": "string"
    }
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text) as any;
};
