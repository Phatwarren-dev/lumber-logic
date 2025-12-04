import React from 'react';
import { Settings } from '../types';
import { Settings2 } from 'lucide-react';

interface Props {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

export const SettingsPanel: React.FC<Props> = ({ settings, setSettings }) => {
  const handleChange = (field: keyof Settings, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      [field]: field === 'unit' ? value : Number(value)
    }));
  };

  return (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
      <div className="flex items-center gap-2 mb-3 text-slate-700 font-semibold">
        <Settings2 size={20} />
        <h3>Workshop Standards</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Unit System</label>
          <select 
            value={settings.unit} 
            onChange={(e) => handleChange('unit', e.target.value)}
            className="w-full p-2 border rounded text-sm bg-white"
          >
            <option value="mm">Metric (mm)</option>
            <option value="inch">Imperial (inch)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">
            Thickness Allowance ({settings.unit})
            <span className="ml-1 text-xs text-amber-600">(Planer)</span>
          </label>
          <input
            type="number"
            value={settings.thicknessAllowance}
            onChange={(e) => handleChange('thicknessAllowance', e.target.value)}
            className="w-full p-2 border rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">
            Width Allowance ({settings.unit})
            <span className="ml-1 text-xs text-amber-600">(Jointer)</span>
          </label>
          <input
            type="number"
            value={settings.widthAllowance}
            onChange={(e) => handleChange('widthAllowance', e.target.value)}
            className="w-full p-2 border rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">
            Saw Kerf ({settings.unit})
            <span className="ml-1 text-xs text-amber-600">(Blade)</span>
          </label>
          <input
            type="number"
            value={settings.kerf}
            onChange={(e) => handleChange('kerf', e.target.value)}
            className="w-full p-2 border rounded text-sm"
          />
        </div>
      </div>
    </div>
  );
};