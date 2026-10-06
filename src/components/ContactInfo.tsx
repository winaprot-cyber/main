interface Props {
  onClose: () => void;
}

export function ContactInfo({ onClose }: Props) {
  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-2xl max-w-md w-full border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <i className="fas fa-info-circle text-cyan-400"></i>
            Información de Contacto
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Logo y nombre */}
          <div className="text-center pb-4 border-b border-slate-700">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/20">
              <i className="fas fa-clock text-white text-3xl"></i>
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              CONTROL DE ASISTENCIA
            </h3>
            <p className="text-sm text-slate-400 mt-1">Versión 1.4.9</p>
          </div>

          {/* Información del programador */}
          <div className="space-y-3">
            <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-400 rounded-xl flex items-center justify-center">
                  <i className="fas fa-user text-white text-lg"></i>
                </div>
                <div>
                  <div className="font-semibold text-white">Creador by</div>
                  <div className="text-sm text-slate-400">Desarrollador Principal</div>
                </div>
              </div>
              <div className="text-lg font-bold text-cyan-400 text-center">
                Hugo Leon
              </div>
            </div>

            {/* Características */}
            <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <i className="fas fa-star text-amber-400"></i>
                Características
              </h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <i className="fas fa-check text-green-400 mt-1"></i>
                  <span>Control de asistencia con cálculo automático de horas</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-check text-green-400 mt-1"></i>
                  <span>Gestión de días feriados con pago al 100%</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-check text-green-400 mt-1"></i>
                  <span>Bonos fijos y variables</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-check text-green-400 mt-1"></i>
                  <span>Quincena y descuentos automáticos</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-check text-green-400 mt-1"></i>
                  <span>Cálculo de 14to sueldo</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-check text-green-400 mt-1"></i>
                  <span>100% offline con almacenamiento local</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-check text-green-400 mt-1"></i>
                  <span>Reportes y gráficos interactivos</span>
                </li>
              </ul>
            </div>

            {/* Tecnologías */}
            <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <i className="fas fa-code text-blue-400"></i>
                Tecnologías Utilizadas
              </h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs border border-blue-500/30">
                  React 18
                </span>
                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs border border-cyan-500/30">
                  TypeScript
                </span>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs border border-purple-500/30">
                  Tailwind CSS
                </span>
                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs border border-green-500/30">
                  Vite
                </span>
                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs border border-amber-500/30">
                  Recharts
                </span>
                <span className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-xs border border-pink-500/30">
                  date-fns
                </span>
              </div>
            </div>

            {/* Información legal */}
            <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <i className="fas fa-shield-alt text-green-400"></i>
                Privacidad y Seguridad
              </h4>
              <ul className="space-y-1 text-xs text-slate-400">
                <li>✓ Todos los datos se almacenan localmente en tu dispositivo</li>
                <li>✓ No se envía información a servidores externos</li>
                <li>✓ Funciona 100% offline</li>
                <li>✓ Sin cookies ni tracking</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-700 text-center">
            <p className="text-xs text-slate-500">
              © 2026 Hugo Leon. Todos los derechos reservados.
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Aplicación desarrollada con ❤️ para el control de asistencia
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium text-slate-300 transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
