import { useState, useEffect } from 'react';

interface Props {
  onExportData: () => void;
  onImportData: () => void;
  onDownloadApp: () => void;
  onChangeTheme: () => void;
  onShowContact: () => void;
}

export function OptionsMenu({ onExportData, onImportData, onDownloadApp, onChangeTheme, onShowContact }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.options-menu')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative options-menu">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-slate-700/50 hover:bg-slate-700 rounded-full flex items-center justify-center transition-all"
        title="Opciones"
      >
        <i className="fas fa-ellipsis-v text-slate-300"></i>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="py-2">
            <button
              onClick={() => {
                onExportData();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-slate-700/50 transition-all flex items-center gap-3"
            >
              <i className="fas fa-download text-green-400 w-5"></i>
              <div>
                <div className="text-sm font-medium text-white">Exportar Base de Datos</div>
                <div className="text-xs text-slate-400">Descargar backup JSON</div>
              </div>
            </button>

            <button
              onClick={() => {
                onImportData();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-slate-700/50 transition-all flex items-center gap-3"
            >
              <i className="fas fa-upload text-blue-400 w-5"></i>
              <div>
                <div className="text-sm font-medium text-white">Importar Base de Datos</div>
                <div className="text-xs text-slate-400">Restaurar desde backup</div>
              </div>
            </button>

            <div className="border-t border-slate-700 my-2"></div>

            <button
              onClick={() => {
                onDownloadApp();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-slate-700/50 transition-all flex items-center gap-3"
            >
              <i className="fas fa-file-archive text-purple-400 w-5"></i>
              <div>
                <div className="text-sm font-medium text-white">Descargar App Offline</div>
                <div className="text-xs text-slate-400">ZIP completo con todos los archivos</div>
              </div>
            </button>

            <div className="border-t border-slate-700 my-2"></div>

            <button
              onClick={() => {
                onChangeTheme();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-slate-700/50 transition-all flex items-center gap-3"
            >
              <i className="fas fa-palette text-amber-400 w-5"></i>
              <div>
                <div className="text-sm font-medium text-white">Cambiar Colores</div>
                <div className="text-xs text-slate-400">Personalizar tema</div>
              </div>
            </button>

            <button
              onClick={() => {
                onShowContact();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-slate-700/50 transition-all flex items-center gap-3"
            >
              <i className="fas fa-info-circle text-cyan-400 w-5"></i>
              <div>
                <div className="text-sm font-medium text-white">Información de Contacto</div>
                <div className="text-xs text-slate-400">Datos del programador</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
