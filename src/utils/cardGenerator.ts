import { PersonalExpense, PersonalDebt } from '../types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const EXPENSE_CATEGORIES = {
  utilities: { label: 'Servicios', icon: '⚡', color: '#f59e0b' },
  rent: { label: 'Arriendo', icon: '🏠', color: '#ef4444' },
  food: { label: 'Alimentación', icon: '🍽️', color: '#10b981' },
  transport: { label: 'Transporte', icon: '🚗', color: '#3b82f6' },
  entertainment: { label: 'Entretenimiento', icon: '🎬', color: '#8b5cf6' },
  health: { label: 'Salud', icon: '❤️', color: '#ec4899' },
  education: { label: 'Educación', icon: '🎓', color: '#06b6d4' },
  other: { label: 'Otros', icon: '📦', color: '#64748b' }
};

const DEBT_TYPES = {
  bank: { label: 'Bancaria', icon: '🏦', color: '#3b82f6' },
  personal: { label: 'Particular', icon: '👤', color: '#8b5cf6' },
  credit_card: { label: 'Tarjeta', icon: '💳', color: '#ef4444' },
  quirurgico: { label: 'Quirúrgico', icon: '🏥', color: '#f59e0b' },
  other: { label: 'Otro', icon: '📋', color: '#64748b' }
};

// Función para dibujar el sello del programa
const drawSeal = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  // Círculo exterior
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
  ctx.lineWidth = 3;
  ctx.stroke();
  
  // Círculo interior
  ctx.beginPath();
  ctx.arc(x, y, size * 0.85, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Texto circular superior
  ctx.save();
  ctx.translate(x, y);
  ctx.font = `bold ${size * 0.18}px Arial`;
  ctx.fillStyle = 'rgba(6, 182, 212, 0.9)';
  ctx.textAlign = 'center';
  
  const text = 'CONTROL DE ASISTENCIA';
  const radius = size * 0.65;
  const angleStep = (Math.PI * 0.8) / text.length;
  const startAngle = -Math.PI * 0.9;
  
  for (let i = 0; i < text.length; i++) {
    const angle = startAngle + i * angleStep;
    ctx.save();
    ctx.rotate(angle);
    ctx.translate(0, -radius);
    ctx.rotate(Math.PI / 2);
    ctx.fillText(text[i], 0, 0);
    ctx.restore();
  }
  
  // Texto circular inferior
  const text2 = 'CREADOR BY HUGO LEON';
  const angleStep2 = (Math.PI * 0.8) / text2.length;
  const startAngle2 = Math.PI * 0.1;
  
  ctx.font = `bold ${size * 0.15}px Arial`;
  ctx.fillStyle = 'rgba(59, 130, 246, 0.9)';
  
  for (let i = 0; i < text2.length; i++) {
    const angle = startAngle2 + i * angleStep2;
    ctx.save();
    ctx.rotate(angle);
    ctx.translate(0, -radius);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(text2[i], 0, 0);
    ctx.restore();
  }
  
  ctx.restore();
  
  // Icono central
  ctx.font = `${size * 0.5}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('💰', x, y);
};

export const generateExpenseCard = (expense: PersonalExpense): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  const width = 800;
  const height = 1000;
  canvas.width = width;
  canvas.height = height;
  
  const categoryInfo = EXPENSE_CATEGORIES[expense.category];
  const paidAmount = expense.paidAmount || 0;
  const netAmount = expense.amount - paidAmount;
  const paymentProgress = (paidAmount / expense.amount) * 100;
  
  // Fondo con gradiente elegante
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#0f172a');
  gradient.addColorStop(0.5, '#1e293b');
  gradient.addColorStop(1, '#0f172a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Borde decorativo
  ctx.strokeStyle = categoryInfo.color;
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, width - 40, height - 40);
  
  // Header con color de categoría
  const headerGradient = ctx.createLinearGradient(0, 0, width, 0);
  headerGradient.addColorStop(0, categoryInfo.color);
  headerGradient.addColorStop(1, categoryInfo.color + '80');
  ctx.fillStyle = headerGradient;
  ctx.fillRect(20, 20, width - 40, 150);
  
  // Icono y título
  ctx.font = 'bold 80px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(categoryInfo.icon, width / 2, 100);
  
  ctx.font = 'bold 36px Arial';
  ctx.fillText(expense.name, width / 2, 150);
  
  // Contenido principal
  let yPos = 220;
  
  // Categoría
  ctx.font = '20px Arial';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'left';
  ctx.fillText('Categoría:', 60, yPos);
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = categoryInfo.color;
  ctx.textAlign = 'right';
  ctx.fillText(categoryInfo.label, width - 60, yPos);
  yPos += 50;
  
  // Frecuencia
  const frequencyLabel = expense.frequency === 'monthly' ? 'Mensual' :
                        expense.frequency === 'weekly' ? 'Semanal' :
                        expense.frequency === 'yearly' ? 'Anual' : 'Único';
  ctx.font = '20px Arial';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'left';
  ctx.fillText('Frecuencia:', 60, yPos);
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'right';
  ctx.fillText(frequencyLabel, width - 60, yPos);
  yPos += 50;
  
  // Fecha de vencimiento
  if (expense.dueDate) {
    ctx.font = '20px Arial';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';
    ctx.fillText('Vencimiento:', 60, yPos);
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.fillText(format(parseISO(expense.dueDate), 'dd/MM/yyyy'), width - 60, yPos);
    yPos += 50;
  }
  
  // Línea separadora
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, yPos);
  ctx.lineTo(width - 60, yPos);
  ctx.stroke();
  yPos += 40;
  
  // Monto Total
  ctx.font = '20px Arial';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'left';
  ctx.fillText('Monto Total:', 60, yPos);
  ctx.font = 'bold 36px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'right';
  ctx.fillText(`$${expense.amount.toFixed(2)}`, width - 60, yPos);
  yPos += 60;
  
  // Monto Pagado
  ctx.font = '20px Arial';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'left';
  ctx.fillText('Monto Pagado:', 60, yPos);
  ctx.font = 'bold 32px Arial';
  ctx.fillStyle = '#10b981';
  ctx.textAlign = 'right';
  ctx.fillText(`$${paidAmount.toFixed(2)}`, width - 60, yPos);
  yPos += 50;
  
  // Monto Pendiente
  ctx.font = '20px Arial';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'left';
  ctx.fillText('Monto Pendiente:', 60, yPos);
  ctx.font = 'bold 32px Arial';
  ctx.fillStyle = '#ef4444';
  ctx.textAlign = 'right';
  ctx.fillText(`$${netAmount.toFixed(2)}`, width - 60, yPos);
  yPos += 60;
  
  // Barra de progreso
  ctx.fillStyle = '#334155';
  ctx.fillRect(60, yPos, width - 120, 40);
  
  const progressGradient = ctx.createLinearGradient(60, yPos, 60 + (width - 120) * (paymentProgress / 100), yPos);
  progressGradient.addColorStop(0, '#10b981');
  progressGradient.addColorStop(1, '#059669');
  ctx.fillStyle = progressGradient;
  ctx.fillRect(60, yPos, (width - 120) * (paymentProgress / 100), 40);
  
  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(`${paymentProgress.toFixed(1)}% Pagado`, width / 2, yPos + 28);
  yPos += 80;
  
  // Notas
  if (expense.notes) {
    ctx.font = '18px Arial';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';
    ctx.fillText('Notas:', 60, yPos);
    yPos += 30;
    
    ctx.font = 'italic 18px Arial';
    ctx.fillStyle = '#cbd5e1';
    const words = expense.notes.split(' ');
    let line = '';
    const maxWidth = width - 120;
    
    for (const word of words) {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line, 60, yPos);
        line = word + ' ';
        yPos += 25;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 60, yPos);
  }
  
  // Sello del programa
  drawSeal(ctx, width - 120, height - 120, 80);
  
  // Footer
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(20, height - 100, width - 40, 80);
  
  ctx.font = '16px Arial';
  ctx.fillStyle = '#64748b';
  ctx.textAlign = 'center';
  ctx.fillText('Balance Personal - Control de Asistencia', width / 2, height - 70);
  ctx.fillText(`Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, width / 2, height - 45);
  
  return canvas.toDataURL('image/png');
};

export const generateDebtCard = (debt: PersonalDebt): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  const width = 800;
  const height = 1100;
  canvas.width = width;
  canvas.height = height;
  
  const typeInfo = DEBT_TYPES[debt.type];
  const pending = debt.totalAmount - debt.paidAmount;
  const progress = (debt.paidAmount / debt.totalAmount) * 100;
  
  // Fondo con gradiente elegante
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#0f172a');
  gradient.addColorStop(0.5, '#1e293b');
  gradient.addColorStop(1, '#0f172a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Borde decorativo
  ctx.strokeStyle = typeInfo.color;
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, width - 40, height - 40);
  
  // Header con color de tipo
  const headerGradient = ctx.createLinearGradient(0, 0, width, 0);
  headerGradient.addColorStop(0, typeInfo.color);
  headerGradient.addColorStop(1, typeInfo.color + '80');
  ctx.fillStyle = headerGradient;
  ctx.fillRect(20, 20, width - 40, 150);
  
  // Icono y título
  ctx.font = 'bold 80px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(typeInfo.icon, width / 2, 100);
  
  ctx.font = 'bold 36px Arial';
  ctx.fillText(debt.name, width / 2, 150);
  
  // Contenido
  let yPos = 220;
  
  // Tipo de deuda
  ctx.font = '20px Arial';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'left';
  ctx.fillText('Tipo de Deuda:', 60, yPos);
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = typeInfo.color;
  ctx.textAlign = 'right';
  ctx.fillText(typeInfo.label, width - 60, yPos);
  yPos += 50;
  
  // Tasa de interés
  if (debt.interestRate) {
    ctx.font = '20px Arial';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';
    ctx.fillText('Tasa de Interés:', 60, yPos);
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#f59e0b';
    ctx.textAlign = 'right';
    ctx.fillText(`${debt.interestRate}% anual`, width - 60, yPos);
    yPos += 50;
  }
  
  // Número de pagos
  if (debt.totalPayments) {
    ctx.font = '20px Arial';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';
    ctx.fillText('Pagos:', 60, yPos);
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#3b82f6';
    ctx.textAlign = 'right';
    ctx.fillText(`${debt.completedPayments || 0} / ${debt.totalPayments}`, width - 60, yPos);
    yPos += 50;
  }
  
  // Línea separadora
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, yPos);
  ctx.lineTo(width - 60, yPos);
  ctx.stroke();
  yPos += 40;
  
  // Monto Total
  ctx.font = '20px Arial';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'left';
  ctx.fillText('Monto Total:', 60, yPos);
  ctx.font = 'bold 36px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'right';
  ctx.fillText(`$${debt.totalAmount.toFixed(2)}`, width - 60, yPos);
  yPos += 60;
  
  // Pago Mensual
  ctx.font = '20px Arial';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'left';
  ctx.fillText('Pago Mensual:', 60, yPos);
  ctx.font = 'bold 32px Arial';
  ctx.fillStyle = '#06b6d4';
  ctx.textAlign = 'right';
  ctx.fillText(`$${debt.monthlyPayment.toFixed(2)}`, width - 60, yPos);
  yPos += 50;
  
  // Monto Pagado
  ctx.font = '20px Arial';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'left';
  ctx.fillText('Monto Pagado:', 60, yPos);
  ctx.font = 'bold 32px Arial';
  ctx.fillStyle = '#10b981';
  ctx.textAlign = 'right';
  ctx.fillText(`$${debt.paidAmount.toFixed(2)}`, width - 60, yPos);
  yPos += 50;
  
  // Monto Pendiente
  ctx.font = '20px Arial';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'left';
  ctx.fillText('Monto Pendiente:', 60, yPos);
  ctx.font = 'bold 32px Arial';
  ctx.fillStyle = '#ef4444';
  ctx.textAlign = 'right';
  ctx.fillText(`$${pending.toFixed(2)}`, width - 60, yPos);
  yPos += 60;
  
  // Barra de progreso
  ctx.fillStyle = '#334155';
  ctx.fillRect(60, yPos, width - 120, 40);
  
  const progressGradient = ctx.createLinearGradient(60, yPos, 60 + (width - 120) * (progress / 100), yPos);
  progressGradient.addColorStop(0, '#8b5cf6');
  progressGradient.addColorStop(1, '#ec4899');
  ctx.fillStyle = progressGradient;
  ctx.fillRect(60, yPos, (width - 120) * (progress / 100), 40);
  
  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(`${progress.toFixed(1)}% Completado`, width / 2, yPos + 28);
  yPos += 80;
  
  // Sello del programa
  drawSeal(ctx, width - 120, height - 120, 80);
  
  // Footer
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(20, height - 100, width - 40, 80);
  
  ctx.font = '16px Arial';
  ctx.fillStyle = '#64748b';
  ctx.textAlign = 'center';
  ctx.fillText('Balance Personal - Control de Asistencia', width / 2, height - 70);
  ctx.fillText(`Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, width / 2, height - 45);
  
  return canvas.toDataURL('image/png');
};

export const generatePaymentReceipt = (
  type: 'expense' | 'debt',
  name: string,
  amount: number,
  paidAmount: number,
  totalAmount: number,
  date: string,
  notes?: string,
  receiptPhoto?: string
): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  const width = 800;
  const height = receiptPhoto ? 1200 : 1000;
  canvas.width = width;
  canvas.height = height;
  
  const isExpense = type === 'expense';
  const color = isExpense ? '#10b981' : '#8b5cf6';
  const icon = isExpense ? '📄' : '💳';
  const title = isExpense ? 'COMPROBANTE DE PAGO' : 'COMPROBANTE DE PAGO';
  const subtitle = isExpense ? 'GASTO' : 'DEUDA';
  
  // Fondo con gradiente elegante
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#0f172a');
  gradient.addColorStop(0.5, '#1e293b');
  gradient.addColorStop(1, '#0f172a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Borde decorativo
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, width - 40, height - 40);
  
  // Header con color
  const headerGradient = ctx.createLinearGradient(0, 0, width, 0);
  headerGradient.addColorStop(0, color);
  headerGradient.addColorStop(1, color + '80');
  ctx.fillStyle = headerGradient;
  ctx.fillRect(20, 20, width - 40, 120);
  
  // Título
  ctx.font = 'bold 32px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(title, width / 2, 70);
  ctx.font = 'bold 24px Arial';
  ctx.fillText(subtitle, width / 2, 110);
  
  // Contenido
  let yPos = 180;
  
  // Icono y nombre
  ctx.font = 'bold 60px Arial';
  ctx.fillText(icon, width / 2, yPos);
  yPos += 60;
  
  ctx.font = 'bold 28px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(name, width / 2, yPos);
  yPos += 60;
  
  // Línea separadora
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, yPos);
  ctx.lineTo(width - 60, yPos);
  ctx.stroke();
  yPos += 50;
  
  // Fecha del pago
  ctx.font = '20px Arial';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'left';
  ctx.fillText('Fecha del Pago:', 60, yPos);
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'right';
  ctx.fillText(format(parseISO(date), 'dd/MM/yyyy HH:mm'), width - 60, yPos);
  yPos += 50;
  
  // Monto del pago
  ctx.font = '20px Arial';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'left';
  ctx.fillText('Monto Pagado:', 60, yPos);
  ctx.font = 'bold 40px Arial';
  ctx.fillStyle = color;
  ctx.textAlign = 'right';
  ctx.fillText(`$${amount.toFixed(2)}`, width - 60, yPos);
  yPos += 60;
  
  // Monto total
  ctx.font = '20px Arial';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'left';
  ctx.fillText('Monto Total:', 60, yPos);
  ctx.font = 'bold 28px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'right';
  ctx.fillText(`$${totalAmount.toFixed(2)}`, width - 60, yPos);
  yPos += 50;
  
  // Monto restante
  const remaining = totalAmount - paidAmount;
  ctx.font = '20px Arial';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'left';
  ctx.fillText('Monto Restante:', 60, yPos);
  ctx.font = 'bold 28px Arial';
  ctx.fillStyle = remaining > 0 ? '#ef4444' : '#10b981';
  ctx.textAlign = 'right';
  ctx.fillText(`$${remaining.toFixed(2)}`, width - 60, yPos);
  yPos += 50;
  
  // Total pagado acumulado
  ctx.font = '20px Arial';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'left';
  ctx.fillText('Total Pagado Acumulado:', 60, yPos);
  ctx.font = 'bold 28px Arial';
  ctx.fillStyle = '#10b981';
  ctx.textAlign = 'right';
  ctx.fillText(`$${paidAmount.toFixed(2)}`, width - 60, yPos);
  yPos += 60;
  
  // Barra de progreso
  const progress = (paidAmount / totalAmount) * 100;
  ctx.fillStyle = '#334155';
  ctx.fillRect(60, yPos, width - 120, 40);
  
  const progressGradient = ctx.createLinearGradient(60, yPos, 60 + (width - 120) * (progress / 100), yPos);
  progressGradient.addColorStop(0, color);
  progressGradient.addColorStop(1, color + '80');
  ctx.fillStyle = progressGradient;
  ctx.fillRect(60, yPos, (width - 120) * (progress / 100), 40);
  
  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(`${progress.toFixed(1)}% Completado`, width / 2, yPos + 28);
  yPos += 70;
  
  // Foto de respaldo si existe
  if (receiptPhoto) {
    ctx.font = '20px Arial';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';
    ctx.fillText('Foto de Factura:', 60, yPos);
    yPos += 30;
    
    // Crear imagen de la foto
    const img = new Image();
    img.src = receiptPhoto;
    
    // Dibujar la imagen (simplificado - en producción necesitarías cargar la imagen primero)
    ctx.fillStyle = '#334155';
    ctx.fillRect(60, yPos, width - 120, 200);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(60, yPos, width - 120, 200);
    
    ctx.font = '16px Arial';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.fillText('📷 Foto de respaldo adjunta', width / 2, yPos + 100);
    
    yPos += 230;
  }
  
  // Notas
  if (notes) {
    ctx.font = '18px Arial';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';
    ctx.fillText('Notas:', 60, yPos);
    yPos += 30;
    
    ctx.font = 'italic 18px Arial';
    ctx.fillStyle = '#cbd5e1';
    const words = notes.split(' ');
    let line = '';
    const maxWidth = width - 120;
    
    for (const word of words) {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line, 60, yPos);
        line = word + ' ';
        yPos += 25;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 60, yPos);
  }
  
  // Sello del programa
  drawSeal(ctx, width - 120, height - 120, 80);
  
  // Footer
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(20, height - 100, width - 40, 80);
  
  ctx.font = '16px Arial';
  ctx.fillStyle = '#64748b';
  ctx.textAlign = 'center';
  ctx.fillText('Balance Personal - Control de Asistencia', width / 2, height - 70);
  ctx.fillText(`Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, width / 2, height - 45);
  
  return canvas.toDataURL('image/png');
};

export const downloadCard = (dataUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
};

export const shareCardWhatsApp = (dataUrl: string, title: string) => {
  fetch(dataUrl)
    .then(res => res.blob())
    .then(blob => {
      const file = new File([blob], `${title}.png`, { type: 'image/png' });
      
      if (navigator.share) {
        navigator.share({
          title: title,
          text: `Ficha de ${title}`,
          files: [file]
        }).catch(err => {
          console.error('Error al compartir:', err);
          downloadCard(dataUrl, `${title}.png`);
          alert('Imagen descargada. Puedes compartirla manualmente por WhatsApp.');
        });
      } else {
        downloadCard(dataUrl, `${title}.png`);
        alert('Imagen descargada. Puedes compartirla manualmente por WhatsApp.');
      }
    });
};
