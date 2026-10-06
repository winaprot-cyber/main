import { useState } from 'react';

export function WelcomeModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useState(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcomeModal');
    
    if (!hasSeenWelcome) {
      setTimeout(() => {
        setIsVisible(true);
        setShowModal(true);
      }, 1000);
    }
  });

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setShowModal(false);
      localStorage.setItem('hasSeenWelcomeModal', 'true');
    }, 300);
  };

  if (!showModal) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div 
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl max-w-sm w-full border border-purple-500/30 shadow-2xl shadow-purple-500/20 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-6 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
            <i className="fas fa-clock text-5xl text-white"></i>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">
            ¡Bienvenido!
          </h2>
          <p className="text-white/90 text-sm">
            Control de Asistencia
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="fas fa-clock text-green-400 text-sm"></i>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Registro de Asistencia</p>
                <p className="text-slate-400 text-xs">Controla tus horas de trabajo</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="fas fa-umbrella-beach text-blue-400 text-sm"></i>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Días Feriados</p>
                <p className="text-slate-400 text-xs">Registra feriados y horas al 100%</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="fas fa-gift text-amber-400 text-sm"></i>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Bonos y Descuentos</p>
                <p className="text-slate-400 text-xs">Gestiona bonos fijos y variables</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 rounded-xl font-bold text-white shadow-lg shadow-purple-500/30 transition-all"
          >
            Comenzar
          </button>
        </div>

        <div className="bg-slate-800/50 px-6 py-3 text-center border-t border-slate-700/50">
          <p className="text-slate-500 text-xs">
            Creador by Hugo Leon | Versión 1.4.9
          </p>
        </div>
      </div>
    </div>
  );
}
