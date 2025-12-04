import React from 'react';
import { OptimizationResult, Settings } from '../types';
import { ShoppingCart, AlertTriangle, CheckCircle2, Layers } from 'lucide-react';

interface Props {
  result: OptimizationResult;
  settings: Settings;
}

export const ResultDisplay: React.FC<Props> = ({ result, settings }) => {
  return (
    <div className="mt-8 space-y-6">
      
      {result.unmatchableParts && result.unmatchableParts.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3">
          <AlertTriangle className="shrink-0 mt-1" />
          <div>
            <h3 className="font-bold">Unmatchable Parts</h3>
            <p className="text-sm mt-1">
              The following parts could not be fit into any available raw stock sizes (considering machining allowance):
            </p>
            <ul className="list-disc ml-5 mt-2 text-sm">
              {result.unmatchableParts.map((name, i) => <li key={i}>{name}</li>)}
            </ul>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg border border-amber-100 overflow-hidden">
        <div className="bg-amber-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart size={24} />
            <h2 className="text-xl font-bold">Shopping List & Cut Plan</h2>
          </div>
          <div className="text-amber-100 text-sm">
             Total Raw Volume: {result.totalRawVolume} {settings.unit}³
          </div>
        </div>

        <div className="p-6 grid gap-8">
          {result.plan.map((item, idx) => (
            <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center">
                <div>
                   <span className="font-bold text-lg text-slate-800">{item.rawStockName}</span>
                   <span className="text-slate-500 text-sm ml-2">
                     ({item.dimensions.thickness} x {item.dimensions.width} x {item.dimensions.length} {settings.unit})
                   </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-sm">Buy:</span>
                    <span className="bg-slate-800 text-white px-3 py-1 rounded-full font-bold">
                        {item.quantityNeeded}
                    </span>
                </div>
              </div>
              
              <div className="p-5 bg-white">
                <div className="flex justify-between items-end mb-2">
                   <h4 className="text-xs font-bold text-slate-400 uppercase">Cut Diagram</h4>
                   <span className="text-xs text-slate-400">Total Length: {item.dimensions.length} {settings.unit}</span>
                </div>
                
                {/* Visual Representation of the Cut */}
                <div className="flex w-full h-20 bg-slate-100 rounded border border-slate-300 relative mb-6">
                  {item.cuts.map((cut, cIdx) => {
                     const widthPercent = (cut.length / item.dimensions.length) * 100;
                     const isGlue = cut.partName.toLowerCase().includes('glue') || cut.partName.toLowerCase().includes('layer');
                     const displayName = cut.partName.replace(/\s*\(Glue Layer\)/i, '').trim();
                     
                     return (
                       <div 
                        key={cIdx} 
                        style={{width: `${widthPercent}%`}}
                        className={`
                          h-full border-r border-slate-400 flex flex-col items-center justify-center 
                          px-1 relative group transition-colors overflow-hidden
                          ${isGlue ? 'bg-amber-50' : 'bg-amber-100'}
                        `}
                        title={`${cut.partName}: ${cut.length}`}
                       >
                         <div className="flex flex-col items-center justify-between h-full w-full py-2 z-10">
                             <span className="text-[10px] md:text-xs font-bold text-amber-900 truncate w-full text-center leading-tight">
                                {displayName}
                             </span>
                             
                             <span className="text-[10px] font-mono text-slate-600 bg-white/60 px-1 rounded shadow-sm">
                                {cut.length}
                             </span>
                         </div>

                         {/* Thin Red Glue Line Indicator on Bottom Edge */}
                         {isGlue && (
                           <div className="absolute bottom-0 left-0 w-full h-[3px] bg-red-500 z-20"></div>
                         )}
                       </div>
                     );
                  })}
                  
                  {/* Waste Area */}
                  <div 
                    className="flex-grow h-full flex items-center justify-center text-xs text-slate-400 italic"
                    style={{
                        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, #f1f5f9 5px, #f1f5f9 10px)'
                    }}
                  >
                     <span className="bg-white/80 px-1 rounded backdrop-blur-sm">Waste</span>
                  </div>
                </div>

                {/* Legend / Key if Glued parts exist */}
                {item.cuts.some(c => c.partName.toLowerCase().includes('glue')) && (
                     <div className="flex items-center gap-2 mb-4 text-xs text-slate-500 bg-slate-50 p-2 rounded inline-flex">
                        <div className="w-6 h-[3px] bg-red-500"></div>
                        <span>Red line indicates surface to be glued</span>
                     </div>
                )}

                <div className="space-y-1">
                   {item.cuts.map((cut, cIdx) => {
                     const isGlue = cut.partName.toLowerCase().includes('glue') || cut.partName.toLowerCase().includes('layer');
                     return (
                       <div key={cIdx} className="flex justify-between text-sm border-b border-slate-50 last:border-0 py-1 hover:bg-slate-50 px-2 rounded">
                          <div className="flex items-center gap-2">
                            {isGlue ? (
                                <Layers size={14} className="text-red-500" />
                            ) : (
                                <CheckCircle2 size={14} className="text-green-600" />
                            )}
                            <span className={isGlue ? "text-slate-800 font-medium" : "text-slate-700"}>
                                {cut.partName}
                            </span>
                          </div>
                          <div className="font-mono text-slate-500">
                            {cut.length} {settings.unit} (x{cut.count})
                          </div>
                       </div>
                     );
                   })}
                </div>
              </div>
            </div>
          ))}

          {result.plan.length === 0 && !result.unmatchableParts?.length && (
             <div className="text-center py-10 text-slate-400">
                No optimization plan generated yet.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};