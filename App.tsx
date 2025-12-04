import React, { useState } from 'react';
import { FinishedPart, RawStock, Settings, OptimizationResult } from './types';
import { SettingsPanel } from './components/SettingsPanel';
import { InputLists } from './components/InputLists';
import { ResultDisplay } from './components/ResultDisplay';
import { calculateLumberPlan } from './services/geminiService';
import { Hammer, Loader2, Calculator } from 'lucide-react';

const App: React.FC = () => {
  const [parts, setParts] = useState<FinishedPart[]>([]);
  const [stocks, setStocks] = useState<RawStock[]>([]);
  const [settings, setSettings] = useState<Settings>({
    thicknessAllowance: 5, // e.g. 5mm planing allowance
    widthAllowance: 5,     // e.g. 5mm jointing allowance
    kerf: 3,               // e.g. 3mm blade
    unit: 'mm'
  });

  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    if (parts.length === 0 || stocks.length === 0) {
      setError("Please add at least one finished part and one raw stock size.");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const optimization = await calculateLumberPlan(parts, stocks, settings);
      setResult(optimization);
    } catch (e) {
      setError("Failed to calculate optimization. Please check your API key and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 pb-20">
      
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-600 p-2 rounded-lg">
              <Hammer size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-none">LumberLogic</h1>
              <span className="text-xs text-slate-400">Raw Wood Optimizer</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        
        <SettingsPanel settings={settings} setSettings={setSettings} />
        
        <InputLists 
          parts={parts} 
          setParts={setParts} 
          stocks={stocks} 
          setStocks={setStocks} 
          unit={settings.unit}
        />

        {/* Action Area */}
        <div className="mt-8 flex flex-col items-center justify-center">
          {error && (
            <div className="mb-4 text-red-600 bg-red-50 px-4 py-2 rounded border border-red-200">
              {error}
            </div>
          )}
          
          <button 
            type="button"
            onClick={handleCalculate}
            disabled={loading || parts.length === 0}
            className={`
              flex items-center gap-3 px-8 py-4 rounded-full text-lg font-bold shadow-lg transition-all
              ${loading || parts.length === 0 
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                : 'bg-amber-600 hover:bg-amber-700 text-white hover:shadow-xl hover:-translate-y-1'
              }
            `}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" /> Calculating Plan...
              </>
            ) : (
              <>
                <Calculator /> Generate Shopping List
              </>
            )}
          </button>
        </div>

        {result && <ResultDisplay result={result} settings={settings} />}

      </main>
    </div>
  );
};

export default App;