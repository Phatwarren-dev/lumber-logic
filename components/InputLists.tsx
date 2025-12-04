import React, { useState } from 'react';
import { FinishedPart, RawStock } from '../types';
import { Plus, Trash2, Box, Ruler } from 'lucide-react';

interface Props {
  parts: FinishedPart[];
  setParts: React.Dispatch<React.SetStateAction<FinishedPart[]>>;
  stocks: RawStock[];
  setStocks: React.Dispatch<React.SetStateAction<RawStock[]>>;
  unit: string;
}

export const InputLists: React.FC<Props> = ({ parts, setParts, stocks, setStocks, unit }) => {
  const [newPart, setNewPart] = useState<Partial<FinishedPart>>({ name: '', quantity: 1 });
  const [newStock, setNewStock] = useState<Partial<RawStock>>({ name: '' });

  const addPart = () => {
    if (newPart.name && newPart.length && newPart.width && newPart.thickness && newPart.quantity) {
      setParts([...parts, { ...newPart, id: crypto.randomUUID() } as FinishedPart]);
      setNewPart({ name: '', quantity: 1, length: undefined, width: undefined, thickness: undefined });
    }
  };

  const addStock = () => {
    if (newStock.name && newStock.length && newStock.width && newStock.thickness) {
      setStocks([...stocks, { ...newStock, id: crypto.randomUUID() } as RawStock]);
      setNewStock({ name: '', length: undefined, width: undefined, thickness: undefined });
    }
  };

  const removePart = (id: string) => setParts(parts.filter(p => p.id !== id));
  const removeStock = (id: string) => setStocks(stocks.filter(s => s.id !== id));

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Finished Parts Column */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
        <div className="bg-amber-50 p-4 border-b border-amber-100 flex items-center gap-2">
          <Box className="text-amber-600" size={20} />
          <h2 className="font-bold text-amber-900">1. Finished Parts Needed</h2>
        </div>
        
        <div className="p-4 space-y-4 flex-grow">
          <div className="grid grid-cols-12 gap-2 items-end bg-slate-50 p-3 rounded-lg border border-slate-200">
             <div className="col-span-3">
               <label className="text-[10px] uppercase font-bold text-slate-500">Name</label>
               <input 
                 className="w-full p-2 text-sm border rounded" 
                 placeholder="e.g. Table Leg"
                 value={newPart.name}
                 onChange={e => setNewPart({...newPart, name: e.target.value})}
               />
             </div>
             <div className="col-span-2">
               <label className="text-[10px] uppercase font-bold text-slate-500">Thick</label>
               <input type="number" className="w-full p-2 text-sm border rounded" placeholder={unit}
                 value={newPart.thickness || ''}
                 onChange={e => setNewPart({...newPart, thickness: parseFloat(e.target.value)})}
               />
             </div>
             <div className="col-span-2">
               <label className="text-[10px] uppercase font-bold text-slate-500">Width</label>
               <input type="number" className="w-full p-2 text-sm border rounded" placeholder={unit}
                 value={newPart.width || ''}
                 onChange={e => setNewPart({...newPart, width: parseFloat(e.target.value)})}
               />
             </div>
             <div className="col-span-2">
               <label className="text-[10px] uppercase font-bold text-slate-500">Len</label>
               <input type="number" className="w-full p-2 text-sm border rounded" placeholder={unit}
                 value={newPart.length || ''}
                 onChange={e => setNewPart({...newPart, length: parseFloat(e.target.value)})}
               />
             </div>
             <div className="col-span-2">
               <label className="text-[10px] uppercase font-bold text-slate-500">Qty</label>
               <input type="number" className="w-full p-2 text-sm border rounded"
                 value={newPart.quantity || ''}
                 onChange={e => setNewPart({...newPart, quantity: parseFloat(e.target.value)})}
               />
             </div>
             <div className="col-span-1">
               <button type="button" onClick={addPart} className="w-full bg-amber-600 hover:bg-amber-700 text-white p-2 rounded flex justify-center">
                 <Plus size={16} />
               </button>
             </div>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {parts.map(part => (
              <div key={part.id} className="grid grid-cols-12 gap-2 items-center text-sm p-2 hover:bg-slate-50 border-b border-slate-100 last:border-0">
                <div className="col-span-3 font-medium text-slate-700 truncate">{part.name}</div>
                <div className="col-span-6 text-slate-500 text-center">
                   {part.thickness} x {part.width} x {part.length} {unit}
                </div>
                <div className="col-span-2 text-center font-bold text-slate-700">x{part.quantity}</div>
                <div className="col-span-1 flex justify-center">
                  <button type="button" onClick={() => removePart(part.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {parts.length === 0 && <div className="text-center text-slate-400 py-8 text-sm italic">Add finished parts here</div>}
          </div>
        </div>
      </div>

      {/* Raw Stock Column */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
        <div className="bg-slate-100 p-4 border-b border-slate-200 flex items-center gap-2">
          <Ruler className="text-slate-600" size={20} />
          <h2 className="font-bold text-slate-800">2. Available Raw Stock</h2>
        </div>
        
        <div className="p-4 space-y-4 flex-grow">
          <div className="grid grid-cols-12 gap-2 items-end bg-slate-50 p-3 rounded-lg border border-slate-200">
             <div className="col-span-5">
               <label className="text-[10px] uppercase font-bold text-slate-500">Type Name</label>
               <input 
                 className="w-full p-2 text-sm border rounded" 
                 placeholder="e.g. 2x4 Rough"
                 value={newStock.name}
                 onChange={e => setNewStock({...newStock, name: e.target.value})}
               />
             </div>
             <div className="col-span-2">
               <label className="text-[10px] uppercase font-bold text-slate-500">Thick</label>
               <input type="number" className="w-full p-2 text-sm border rounded" placeholder={unit}
                 value={newStock.thickness || ''}
                 onChange={e => setNewStock({...newStock, thickness: parseFloat(e.target.value)})}
               />
             </div>
             <div className="col-span-2">
               <label className="text-[10px] uppercase font-bold text-slate-500">Width</label>
               <input type="number" className="w-full p-2 text-sm border rounded" placeholder={unit}
                 value={newStock.width || ''}
                 onChange={e => setNewStock({...newStock, width: parseFloat(e.target.value)})}
               />
             </div>
             <div className="col-span-2">
               <label className="text-[10px] uppercase font-bold text-slate-500">Length</label>
               <input type="number" className="w-full p-2 text-sm border rounded" placeholder={unit}
                 value={newStock.length || ''}
                 onChange={e => setNewStock({...newStock, length: parseFloat(e.target.value)})}
               />
             </div>
             <div className="col-span-1">
               <button type="button" onClick={addStock} className="w-full bg-slate-700 hover:bg-slate-800 text-white p-2 rounded flex justify-center">
                 <Plus size={16} />
               </button>
             </div>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
             {stocks.map(stock => (
              <div key={stock.id} className="grid grid-cols-12 gap-2 items-center text-sm p-2 hover:bg-slate-50 border-b border-slate-100 last:border-0">
                <div className="col-span-5 font-medium text-slate-700 truncate">{stock.name}</div>
                <div className="col-span-6 text-center text-slate-500">
                   {stock.thickness} x {stock.width} x {stock.length} {unit}
                </div>
                <div className="col-span-1 flex justify-center">
                  <button type="button" onClick={() => removeStock(stock.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
             {stocks.length === 0 && <div className="text-center text-slate-400 py-8 text-sm italic">Add available raw sizes here</div>}
          </div>
        </div>
      </div>
    </div>
  );
};