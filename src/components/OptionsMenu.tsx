import { useState } from 'react';

export function OptionsMenu({ onExportData, onImportData, onDownloadApp, onChangeTheme, onShowContact }: any) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="w-10 h-10 bg-slate-700/50 hover:bg-slate-700 rounded-full flex items-center justify-center">
        <i className="fas fa-ellipsis-v text-slate-300"></i>
      </button>
      {isOpen && (
        <div className="absolute right-0 top-12 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50">
          <button onClick={() => { onExportData(); setIsOpen(false); }} className="w-full px-4 py-3 text-left hover:bg-slate-700/50 flex items-center gap-3">
            <i className="fas fa-download text-green-400"></i>
            <span className="text-sm text-white">Exportar Datos</span>
          </button>
          <button onClick={() => { onImportData(); setIsOpen(false); }} className="w-full px-4 py-3 text-left hover:bg-slate-700/50 flex items-center gap-3">
            <i className="fas fa-upload text-blue-400"></i>
            <span className="text-sm text-white">Importar Datos</span>
          </button>
          <button onClick={() => { onChangeTheme(); setIsOpen(false); }} className="w-full px-4 py-3 text-left hover:bg-slate-700/50 flex items-center gap-3">
            <i className="fas fa-palette text-amber-400"></i>
            <span className="text-sm text-white">Cambiar Tema</span>
          </button>
          <button onClick={() => { onShowContact(); setIsOpen(false); }} className="w-full px-4 py-3 text-left hover:bg-slate-700/50 flex items-center gap-3">
            <i className="fas fa-info-circle text-cyan-400"></i>
            <span className="text-sm text-white">Información</span>
          </button>
        </div>
      )}
    </div>
  );
}
