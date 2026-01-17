
import React, { useState, useCallback } from 'react';
import { 
  PersonaType, 
  DietType, 
  EffortTolerance, 
  UserPreferences, 
  MealPlanResponse 
} from './types';
import { generateMealPlan } from './services/geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MealPlanResponse | null>(null);
  const [pantryInput, setPantryInput] = useState('');

  const [prefs, setPrefs] = useState<UserPreferences>({
    persona: PersonaType.WORKING_PROFESSIONAL,
    diet: DietType.VEG,
    dislikes: '',
    effort: EffortTolerance.MEDIUM,
    pantry: [],
    budget: '',
    cityType: 'Tier 1',
    reminderTime: 'morning',
    cookingWindow: '1 hour',
    reminderFrequency: '2'
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handlePantryAdd = () => {
    if (pantryInput.trim()) {
      setPrefs(p => ({ ...p, pantry: [...p.pantry, pantryInput.trim()] }));
      setPantryInput('');
    }
  };

  const handleSubmit = async () => {
    if (prefs.pantry.length < 5) {
      alert("Please add at least 5 ingredients.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await generateMealPlan(prefs);
      setResult(data);
      setStep(6);
    } catch (err) {
      setError("Failed to generate plan. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-[#FFF5F7] text-slate-800 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-pink-100 py-4 px-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-pink-500">MealWise AI</h1>
          <div className="text-xs font-semibold text-pink-300 uppercase tracking-widest">
            Step {step} of 6
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {step === 1 && (
          <div className="space-y-6">
            <section className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Select your persona</h2>
              <p className="text-slate-500">This helps us tailor cooking times and complexity.</p>
            </section>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.values(PersonaType).map(p => (
                <button
                  key={p}
                  onClick={() => { setPrefs({ ...prefs, persona: p }); nextStep(); }}
                  className={`p-6 rounded-2xl border-2 transition-all text-left ${
                    prefs.persona === p 
                    ? 'border-pink-500 bg-pink-50 ring-4 ring-pink-50' 
                    : 'border-white bg-white hover:border-pink-200'
                  }`}
                >
                  <div className="font-bold text-lg">{p}</div>
                  <p className="text-sm text-slate-500 mt-1">
                    {p === PersonaType.STUDENT ? 'Focus on quick, cheap, and simple.' : 
                     p === PersonaType.WORKING_PROFESSIONAL ? 'Balanced, meal-prep friendly.' : 
                     'Structured family-style variety.'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <section className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Diet & Constraints</h2>
              <p className="text-slate-500">What keeps you going?</p>
            </section>
            <div className="bg-white p-8 rounded-3xl shadow-sm space-y-8">
              <div>
                <label className="block text-sm font-semibold mb-3">Diet Type</label>
                <div className="flex gap-3 flex-wrap">
                  {Object.values(DietType).map(d => (
                    <button
                      key={d}
                      onClick={() => setPrefs({ ...prefs, diet: d })}
                      className={`px-6 py-2 rounded-full border transition-all ${
                        prefs.diet === d ? 'bg-pink-500 text-white border-pink-500' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3">Effort Tolerance</label>
                <div className="flex gap-3 flex-wrap">
                  {Object.values(EffortTolerance).map(e => (
                    <button
                      key={e}
                      onClick={() => setPrefs({ ...prefs, effort: e })}
                      className={`px-6 py-2 rounded-full border transition-all ${
                        prefs.effort === e ? 'bg-pink-500 text-white border-pink-500' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Dislikes / Intolerances</label>
                <input
                  type="text"
                  placeholder="e.g. Mushroom, Shellfish, Garlic"
                  value={prefs.dislikes}
                  onChange={e => setPrefs({ ...prefs, dislikes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <div className="flex justify-between pt-4">
                <button onClick={prevStep} className="px-6 py-2 text-slate-500 font-semibold">Back</button>
                <button onClick={nextStep} className="px-8 py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition-colors">Next</button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <section className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Pantry Input</h2>
              <p className="text-slate-500">Lock ingredients to minimize waste. Minimum 5 items.</p>
            </section>
            <div className="bg-white p-8 rounded-3xl shadow-sm space-y-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add ingredient (e.g. Rice, Onion, Eggs)"
                  value={pantryInput}
                  onChange={e => setPantryInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handlePantryAdd()}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                />
                <button 
                  onClick={handlePantryAdd}
                  className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {prefs.pantry.map((item, i) => (
                  <span key={i} className="px-3 py-1 bg-pink-50 text-pink-600 border border-pink-200 rounded-full text-sm flex items-center gap-2">
                    {item}
                    <button onClick={() => setPrefs({ ...prefs, pantry: prefs.pantry.filter((_, idx) => idx !== i) })} className="hover:text-pink-800">×</button>
                  </span>
                ))}
                {prefs.pantry.length === 0 && <p className="text-slate-400 text-sm italic">No items added yet.</p>}
              </div>
              
              <div className="flex justify-between pt-6">
                <button onClick={prevStep} className="px-6 py-2 text-slate-500 font-semibold">Back</button>
                <button 
                  disabled={prefs.pantry.length < 5}
                  onClick={nextStep} 
                  className={`px-8 py-3 rounded-xl font-bold transition-colors ${prefs.pantry.length < 5 ? 'bg-slate-200 text-slate-400' : 'bg-pink-500 text-white hover:bg-pink-600'}`}
                >
                  Lock Ingredients ({prefs.pantry.length}/5)
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <section className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Daily Settings</h2>
              <p className="text-slate-500">Fine-tune the economics and logistics.</p>
            </section>
            <div className="bg-white p-8 rounded-3xl shadow-sm space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Daily Budget (INR)</label>
                  <input
                    type="number"
                    placeholder="e.g. 300"
                    value={prefs.budget}
                    onChange={e => setPrefs({ ...prefs, budget: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">City Type</label>
                  <select
                    value={prefs.cityType}
                    onChange={e => setPrefs({ ...prefs, cityType: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                  >
                    <option>Tier 1 (Metro)</option>
                    <option>Tier 2/3</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Max Cooking Window</label>
                <select
                  value={prefs.cookingWindow}
                  onChange={e => setPrefs({ ...prefs, cookingWindow: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                >
                  <option>30 mins</option>
                  <option>1 hour</option>
                  <option>2 hours</option>
                </select>
              </div>

              <div className="flex justify-between pt-6">
                <button onClick={prevStep} className="px-6 py-2 text-slate-500 font-semibold">Back</button>
                <button onClick={nextStep} className="px-8 py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition-colors">Next</button>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <section className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Smart Scheduling</h2>
              <p className="text-slate-500">Configure your automated alerts.</p>
            </section>
            <div className="bg-white p-8 rounded-3xl shadow-sm space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Preferred Notification Slot</label>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setPrefs({...prefs, reminderTime: 'morning'})}
                      className={`flex-1 py-3 rounded-xl border-2 ${prefs.reminderTime === 'morning' ? 'border-pink-500 bg-pink-50' : 'border-slate-100 bg-slate-50'}`}
                    >
                      Morning (8 AM)
                    </button>
                    <button 
                      onClick={() => setPrefs({...prefs, reminderTime: 'evening'})}
                      className={`flex-1 py-3 rounded-xl border-2 ${prefs.reminderTime === 'evening' ? 'border-pink-500 bg-pink-50' : 'border-slate-100 bg-slate-50'}`}
                    >
                      Evening (8 PM)
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Frequency per day</label>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setPrefs({...prefs, reminderFrequency: '1'})}
                      className={`flex-1 py-3 rounded-xl border-2 ${prefs.reminderFrequency === '1' ? 'border-pink-500 bg-pink-50' : 'border-slate-100 bg-slate-50'}`}
                    >
                      1 Reminder
                    </button>
                    <button 
                      onClick={() => setPrefs({...prefs, reminderFrequency: '2'})}
                      className={`flex-1 py-3 rounded-xl border-2 ${prefs.reminderFrequency === '2' ? 'border-pink-500 bg-pink-50' : 'border-slate-100 bg-slate-50'}`}
                    >
                      2 Reminders
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <button onClick={prevStep} className="px-6 py-2 text-slate-500 font-semibold">Back</button>
                <button 
                  disabled={isLoading}
                  onClick={handleSubmit} 
                  className="px-8 py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition-all flex items-center gap-2"
                >
                  {isLoading ? 'Generating Plan...' : 'Generate Meal Plan'}
                </button>
              </div>
              {error && <p className="text-red-500 text-center text-sm">{error}</p>}
            </div>
          </div>
        )}

        {step === 6 && result && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Final Report Layout */}
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-pink-100">
               <div>
                 <h2 className="text-xl font-bold text-slate-800">Your Custom Meal Strategy</h2>
                 <p className="text-sm text-slate-500">Generated for {prefs.persona}</p>
               </div>
               <button onClick={reset} className="px-4 py-2 text-pink-500 font-semibold border border-pink-200 rounded-xl hover:bg-pink-50">Start Over</button>
            </div>

            <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
              <div>
                <h3 className="text-lg font-bold border-b pb-2 mb-4">1. Persona Summary</h3>
                <p className="text-slate-600 leading-relaxed">{result.personaSummary}</p>
              </div>

              <div>
                <h3 className="text-lg font-bold border-b pb-2 mb-4">2. Meal Plan (B/L/D)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {result.mealPlan.map(day => (
                    <div key={day.day} className="bg-pink-50 p-4 rounded-2xl border border-pink-100">
                      <div className="font-bold text-pink-600 mb-2">Day {day.day}</div>
                      <div className="space-y-3">
                        <div className="text-sm">
                          <span className="font-semibold block uppercase text-[10px] text-slate-400">Breakfast</span>
                          {day.meals.breakfast}
                        </div>
                        <div className="text-sm">
                          <span className="font-semibold block uppercase text-[10px] text-slate-400">Lunch</span>
                          {day.meals.lunch}
                        </div>
                        <div className="text-sm">
                          <span className="font-semibold block uppercase text-[10px] text-slate-400">Dinner</span>
                          {day.meals.dinner}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold border-b pb-2 mb-4">3. Using Your Ingredients</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {result.usingYourIngredients.map((item, i) => (
                    <li key={i} className="text-slate-600 text-sm">{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold border-b pb-2 mb-4">4. Grocery List</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.groceryList.map((cat, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-2xl">
                      <div className="font-bold text-sm mb-2 text-slate-500 uppercase">{cat.category}</div>
                      <ul className="space-y-1">
                        {cat.items.map((item, j) => (
                          <li key={j} className="text-sm flex items-center gap-2">
                            <input type="checkbox" className="accent-pink-500 rounded" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold border-b pb-2 mb-4">5. Cooking & Prep Schedule</h3>
                <div className="space-y-3">
                  {result.prepSchedule.map((step, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="bg-pink-100 text-pink-600 font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs mt-1">{i + 1}</div>
                      <p className="text-slate-600 text-sm">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold border-b pb-2 mb-4">6. Reminders Schedule</h3>
                <div className="space-y-2">
                  {result.reminders.map((r, i) => (
                    <div key={i} className="text-sm flex items-center gap-3 bg-blue-50 p-3 rounded-xl border border-blue-100">
                      <div className="text-blue-500 font-bold">🔔</div>
                      <p className="text-blue-800">{r}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold border-b pb-2 mb-4">7. Substitutions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.substitutions.map((sub, i) => (
                    <div key={i} className="text-sm bg-slate-50 p-3 rounded-xl">
                      <div className="font-bold mb-1">{sub.meal}</div>
                      <div className="text-slate-500 italic">{sub.options.join(' OR ')}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`p-6 rounded-3xl border ${result.budgetFeasibility.status === 'feasible' ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'}`}>
                <h3 className="text-lg font-bold mb-2">8. Budget Feasibility Check</h3>
                <p className="text-sm mb-4">{result.budgetFeasibility.details}</p>
                {result.budgetFeasibility.fallbacks && (
                  <div className="space-y-4">
                    <p className="text-xs font-bold uppercase text-slate-400">Recommended Fallbacks</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.budgetFeasibility.fallbacks.map((f, i) => (
                        <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                          <div className="font-bold text-sm mb-1">{f.type}</div>
                          <p className="text-xs text-slate-600">{f.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-pink-600 p-6 rounded-3xl text-white">
                <h3 className="text-lg font-bold mb-2">9. Personalisation Proof</h3>
                <p className="text-sm opacity-90 italic">“Based on your persona, budget, city type, time constraints, and ingredient availability...”</p>
                <p className="text-sm mt-3">{result.personalisationProof}</p>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Progress Footer */}
      {step < 6 && (
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-pink-50 p-4 shadow-lg flex justify-center">
           <div className="flex gap-2">
             {[1, 2, 3, 4, 5].map(i => (
               <div key={i} className={`h-1 w-8 rounded-full transition-all ${step >= i ? 'bg-pink-500' : 'bg-pink-100'}`} />
             ))}
           </div>
        </footer>
      )}
    </div>
  );
};

export default App;
