import { useState } from 'react';

interface Props {
  onClose: () => void;
}

export function WelcomeModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl max-w-md w-full border border-slate-700 p-6">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-clock text-white text-3xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">¡Bienvenido!</h2>
          <p className="text-slate-400">Control de Asistencia HL</p>
          <p className="text-sm text-slate-500 mt-2">Versión 1.4.9</p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <i className="fas fa-check-circle text-green-400 mt-1"></i>
            <p className="text-sm text-slate-300">Registro de asistencia con cálculo automático de horas</p>
          </div>
          <div className="flex items-start gap-3">
            <i className="fas fa-check-circle text-green-400 mt-1"></i>
            <p className="text-sm text-slate-300">Gestión de bonos, descuentos y préstamos</p>
          </div>
          <div className="flex items-start gap-3">
            <i className="fas fa-check-circle text-green-400 mt-1"></i>
            <p className="text-sm text-slate-300">Cálculo de IESS y Fondo de Reserva</p>
          </div>
          <div className="flex items-start gap-3">
            <i className="fas fa-check-circle text-green-400 mt-1"></i>
            <p className="text-sm text-slate-300">Balance personal con deudas y gastos</p>
          </div>
          <div className="flex items-start gap-3">
            <i className="fas fa-check-circle text-green-400 mt-1"></i>
            <p className="text-sm text-slate-300">Cálculo automático de décimo cuarto</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 rounded-xl font-semibold text-white transition-all"
        >
          Comenzar
        </button>

        <p className="text-center text-xs text-slate-500 mt-4">
          Creador by Hugo Leon
        </p>
      </div>
    </div>
  );
}
