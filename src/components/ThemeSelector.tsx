import { useState, useEffect } from 'react';

interface Props {
  onClose: () => void;
}

interface Theme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
}

const themes: Theme[] = [
  { name: 'Azul Cyan (Original)', primary: 'from-blue-500 to-cyan-400', secondary: 'from-blue-600 to-cyan-500', accent: 'text-cyan-400' },
  { name: 'Púrpura Rosa', primary: 'from-purple-500 to-pink-400', secondary: 'from-purple-600 to-pink-500', accent: 'text-purple-400' },
  { name: 'Verde Esmeralda', primary: 'from-green-500 to-emerald-400', secondary: 'from-green-600 to-emerald-500', accent: 'text-green-400' },
  { name: 'Naranja Ámbar', primary: 'from-orange-500 to-amber-400', secondary: 'from-orange-600 to-amber-500', accent: 'text-orange-400' },
  { name: 'Rojo Rosa', primary: 'from-red-500 to-rose-400', secondary: 'from-red-600 to-rose-500', accent: 'text-red-400' },
  { name: 'Índigo Violeta', primary: 'from-indigo-500 to-violet-400', secondary: 'from-indigo-600 to-violet-500', accent: 'text-indigo-400' },
];

export function ThemeSelector({ onClose }: Props) {
  const [selectedTheme, setSelectedTheme] = useState<number>(() => {
    const stored = localStorage.getItem('selectedTheme');
    return stored ? parseInt(stored) : 0;
  });

  useEffect(() => {
    localStorage.setItem('selectedTheme', selectedTheme.toString());
    applyTheme(selectedTheme);
  }, [selectedTheme]);

  const applyTheme = (themeIndex: number) => {
    const theme = themes[themeIndex];
    document.documentElement.style.setProperty('--theme-primary', theme.primary);
    document.documentElement.style.setProperty('--theme-secondary', theme.secondary);
    document.documentElement.style.setProperty('--theme-accent', theme.accent);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-2xl max-w-md w-full border border-slate-700 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <i className="fas fa-palette text-amber-400"></i>
            Cambiar Colores
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-sm text-slate-400 mb-4">
            Selecciona un tema de colores para personalizar la aplicación
          </p>

          {themes.map((theme, index) => (
            <button
              key={index}
              onClick={() => setSelectedTheme(index)}
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                selectedTheme === index
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-slate-700 bg-slate-700/30 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${theme.primary}`}></div>
                  <div className="text-left">
                    <div className="font-medium text-white">{theme.name}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Tema {index + 1} de {themes.length}
                    </div>
                  </div>
                </div>
                {selectedTheme === index && (
                  <i className="fas fa-check-circle text-cyan-400 text-xl"></i>
                )}
              </div>
            </button>
          ))}

          <div className="pt-4 border-t border-slate-700">
            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400 rounded-xl font-medium text-white transition-all"
            >
              Aplicar y Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { themes };
