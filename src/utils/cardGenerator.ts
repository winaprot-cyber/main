import { PersonalExpense, PersonalDebt } from '../types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const EXPENSE_CATEGORIES = {
  utilities: { label: 'Servicios (Luz/Agua)', icon: '⚡', color: '#f59e0b' },
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
  credit_card: { label: 'Tarjeta de Crédito', icon: '💳', color: '#ef4444' },
  quirurgico: { label: 'Préstamo Quirúrgico', icon: '🏥', color: '#f59e0b' },
  other: { label: 'Otro', icon: '📋', color: '#64748b' }
};

// Función helper para dibujar esquinas redondeadas
function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Función para dibujar sello/logo del programa
function drawWatermark(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.font = 'bold 120px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.translate(width / 2, height / 2);
  ctx.rotate(-Math.PI / 6);
  ctx.fillText('CONTROL', 0, -30);
  ctx.fillText('ASISTENCIA', 0, 90);
  ctx.restore();
}

// Función para dibujar borde elegante
function drawElegantBorder(ctx: CanvasRenderingContext2D, width: number, height: number, color: string) {
  // Borde exterior
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, 10, 10, width - 20, height - 20, 20);
  ctx.stroke();
  
  // Borde interior decorativo
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.3;
  drawRoundedRect(ctx, 20, 20, width - 40, height - 40, 15);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

// Función para dibujar sello circular
function drawSeal(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string) {
  // Círculo exterior
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  
  // Círculo interior
  ctx.beginPath();
  ctx.arc(x, y, radius - 5, 0, Math.PI * 2);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Texto del sello
  ctx.save();
  ctx.font = 'bold 10px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✓', x, y - 8);
  ctx.font = '8px Arial';
  ctx.fillText('OFICIAL', x, y + 8);
  ctx.restore();
}

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
  
  const width = 700;
  const height = 900;
  canvas.width = width;
  canvas.height = height;
  
  const isExpense = type === 'expense';
  const primaryColor = isExpense ? '#10b981' : '#8b5cf6';
  const secondaryColor = isExpense ? '#059669' : '#7c3aed';
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
  
  // Marca de agua
  drawWatermark(ctx, width, height);
  
  // Borde elegante
  drawElegantBorder(ctx, width, height, primaryColor);
  
  // Header con gradiente
  const headerGradient = ctx.createLinearGradient(0, 0, width, 0);
  headerGradient.addColorStop(0, primaryColor);
  headerGradient.addColorStop(1, secondaryColor);
  ctx.fillStyle = headerGradient;
  drawRoundedRect(ctx, 30, 30, width - 60, 120, 15);
  ctx.fill();
  
  // Sello oficial
  drawSeal(ctx, width - 80, 90, 35, primaryColor);
  
  // Título principal
  ctx.font = 'bold 32px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(title, width / 2, 80);
  
  // Subtítulo
  ctx.font = 'bold 24px Arial';
  ctx.fillText(subtitle, width / 2, 115);
  
  // Icono grande
  ctx.font = 'bold 64px Arial';
  ctx.fillText(icon, width / 2, 200);
  
  // Nombre del gasto/deuda
  ctx.font = 'bold 28px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(name, width / 2, 250);
  
  // Línea separadora decorativa
  const lineGradient = ctx.createLinearGradient(100, 0, width - 100, 0);
  lineGradient.addColorStop(0, 'transparent');
  lineGradient.addColorStop(0.5, primaryColor);
  lineGradient.addColorStop(1, 'transparent');
  ctx.strokeStyle = lineGradient;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(100, 280);
  ctx.lineTo(width - 100, 280);
  ctx.stroke();
  
  // Contenido principal
  let yPos = 330;
  
  // Fecha del pago
  ctx.font = '16px Arial';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'left';
  ctx.fillText('📅 Fecha del Pago:', 60, yPos);
  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'right';
  ctx.fillText(format(parseISO(date), 'dd/MM/yyyy HH:mm'), width - 60, yPos);
  yPos += 50;
  
  // Monto del pago (destacado)
  ctx.fillStyle = primaryColor;
  drawRoundedRect(ctx, 60, yPos - 25, width - 120, 60, 10);
  ctx.fill();
  
  ctx.font = '16px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.fillText('💰 Monto Pagado:', 80, yPos);
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'right';
  ctx.fillText(`$${amount.toFixed(2)}`, width - 80, yPos + 5);
  yPos += 80;
  
  // Información adicional
  ctx.font = '16px Arial';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'left';
  ctx.fillText('Monto Total:', 60, yPos);
  ctx.font = 'bold 22px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'right';
  ctx.fillText(`$${totalAmount.toFixed(2)}`, width - 60, yPos);
  yPos += 40;
  
  // Monto restante
  const remaining = totalAmount - paidAmount;
  ctx.font = '16px Arial';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'left';
  ctx.fillText('Monto Restante:', 60, yPos);
  ctx.font = 'bold 22px Arial';
  ctx.fillStyle = remaining > 0 ? '#ef4444' : '#10b981';
  ctx.textAlign = 'right';
  ctx.fillText(`$${remaining.toFixed(2)}`, width - 60, yPos);
  yPos += 40;
  
  // Total pagado acumulado
  ctx.font = '16px Arial';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'left';
  ctx.fillText('Total Pagado Acumulado:', 60, yPos);
  ctx.font = 'bold 22px Arial';
  ctx.fillStyle = '#10b981';
  ctx.textAlign = 'right';
  ctx.fillText(`$${paidAmount.toFixed(2)}`, width - 60, yPos);
  yPos += 60;
  
  // Barra de progreso elegante
  const progress = (paidAmount / totalAmount) * 100;
  
  // Fondo de la barra
  ctx.fillStyle = '#334155';
  drawRoundedRect(ctx, 60, yPos, width - 120, 40, 20);
  ctx.fill();
  
  // Progreso
  const progressGradient = ctx.createLinearGradient(60, 0, 60 + (width - 120) * (progress / 100), 0);
  progressGradient.addColorStop(0, primaryColor);
  progressGradient.addColorStop(1, secondaryColor);
  ctx.fillStyle = progressGradient;
  drawRoundedRect(ctx, 60, yPos, (width - 120) * (progress / 100), 40, 20);
  ctx.fill();
  
  // Texto del progreso
  ctx.font = 'bold 18px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(`${progress.toFixed(1)}% Completado`, width / 2, yPos + 26);
  yPos += 70;
  
  // Notas (si existen)
  if (notes) {
    ctx.fillStyle = '#1e293b';
    drawRoundedRect(ctx, 60, yPos, width - 120, 80, 10);
    ctx.fill();
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, 60, yPos, width - 120, 80, 10);
    ctx.stroke();
    
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = primaryColor;
    ctx.textAlign = 'left';
    ctx.fillText('📝 Notas:', 80, yPos + 25);
    
    ctx.font = 'italic 14px Arial';
    ctx.fillStyle = '#cbd5e1';
    const words = notes.split(' ');
    let line = '';
    const maxWidth = width - 160;
    let lineY = yPos + 50;
    
    for (const word of words) {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line, 80, lineY);
        line = word + ' ';
        lineY += 20;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 80, lineY);
    yPos += 100;
  }
  
  // Foto de respaldo (si existe)
  if (receiptPhoto) {
    yPos += 20;
    ctx.fillStyle = '#1e293b';
    drawRoundedRect(ctx, 60, yPos, width - 120, 150, 10);
    ctx.fill();
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, 60, yPos, width - 120, 150, 10);
    ctx.stroke();
    
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = primaryColor;
    ctx.textAlign = 'left';
    ctx.fillText('📸 Foto de Respaldo:', 80, yPos + 25);
    
    // Aquí se dibujaría la imagen si se puede cargar
    ctx.font = 'italic 12px Arial';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Imagen adjunta al comprobante', 80, yPos + 50);
    yPos += 170;
  }
  
  // Footer elegante
  ctx.fillStyle = '#0f172a';
  drawRoundedRect(ctx, 30, height - 100, width - 60, 70, 15);
  ctx.fill();
  
  const footerGradient = ctx.createLinearGradient(30, height - 100, width - 30, height - 100);
  footerGradient.addColorStop(0, primaryColor);
  footerGradient.addColorStop(1, secondaryColor);
  ctx.strokeStyle = footerGradient;
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, 30, height - 100, width - 60, 70, 15);
  ctx.stroke();
  
  ctx.font = 'bold 14px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText('CONTROL DE ASISTENCIA - BALANCE PERSONAL', width / 2, height - 70);
  
  ctx.font = '12px Arial';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, width / 2, height - 50);
  
  return canvas.toDataURL('image/png');
};

export const generateExpenseCard = (expense: PersonalExpense): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  const width = 700;
  const height = 900;
  canvas.width = width;
  canvas.height = height;
  
  const categoryInfo = EXPENSE_CATEGORIES[expense.category];
  const paidAmount = expense.paidAmount || 0;
  const netAmount = expense.amount - paidAmount;
  const paymentProgress = (paidAmount / expense.amount) * 100;
  
  // Fondo con gradiente
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#0f172a');
  gradient.addColorStop(1, '#1e293b');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Marca de agua
  drawWatermark(ctx, width, height);
  
  // Borde elegante
  drawElegantBorder(ctx, width, height, categoryInfo.color);
  
  // Header
  const headerGradient = ctx.createLinearGradient(0, 0, width, 0);
  headerGradient.addColorStop(0, categoryInfo.color);
  headerGradient.addColorStop(1, categoryInfo.color + 'CC');
  ctx.fillStyle = headerGradient;
  drawRoundedRect(ctx, 30, 30, width - 60, 120, 15);
  ctx.fill();
  
  // Sello
  drawSeal(ctx, width - 80, 90, 35, categoryInfo.color);
  
  // Título
  ctx.font = 'bold 28px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText('FICHA DE GASTO', width / 2, 80);
  
  // Icono y nombre
  ctx.font = 'bold 48px Arial';
  ctx.fillText(categoryInfo.icon, width / 2, 180);
  
  ctx.font = 'bold 24px Arial';
  ctx.fillText(expense.name, width / 2, 220);
  
  // Contenido
  let yPos = 280;
  
  // Categoría
  ctx.font = '16px Arial';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'left';
  ctx.fillText('Categoría:', 60, yPos);
  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = categoryInfo.color;
  ctx.textAlign = 'right';
  ctx.fillText(categoryInfo.label, width - 60, yPos);
  yPos += 50;
  
  // Montos
  ctx.fillStyle = '#1e293b';
  drawRoundedRect(ctx, 60, yPos, width - 120, 200, 15);
  ctx.fill();
  
  ctx.font = 'bold 18px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.fillText('Monto Total:', 80, yPos + 40);
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'right';
  ctx.fillText(`$${expense.amount.toFixed(2)}`, width - 80, yPos + 40);
  
  ctx.font = 'bold 18px Arial';
  ctx.fillStyle = '#10b981';
  ctx.textAlign = 'left';
  ctx.fillText('Pagado:', 80, yPos + 90);
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'right';
  ctx.fillText(`$${paidAmount.toFixed(2)}`, width - 80, yPos + 90);
  
  ctx.font = 'bold 18px Arial';
  ctx.fillStyle = '#ef4444';
  ctx.textAlign = 'left';
  ctx.fillText('Pendiente:', 80, yPos + 140);
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'right';
  ctx.fillText(`$${netAmount.toFixed(2)}`, width - 80, yPos + 140);
  
  yPos += 230;
  
  // Barra de progreso
  const progressGradient = ctx.createLinearGradient(60, 0, width - 60, 0);
  progressGradient.addColorStop(0, categoryInfo.color);
  progressGradient.addColorStop(1, categoryInfo.color + 'CC');
  ctx.fillStyle = progressGradient;
  drawRoundedRect(ctx, 60, yPos, (width - 120) * (paymentProgress / 100), 30, 15);
  ctx.fill();
  
  ctx.font = 'bold 16px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(`${paymentProgress.toFixed(1)}% Pagado`, width / 2, yPos + 20);
  
  // Footer
  ctx.fillStyle = '#0f172a';
  drawRoundedRect(ctx, 30, height - 100, width - 60, 70, 15);
  ctx.fill();
  
  ctx.font = 'bold 14px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText('CONTROL DE ASISTENCIA - BALANCE PERSONAL', width / 2, height - 70);
  
  ctx.font = '12px Arial';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, width / 2, height - 50);
  
  return canvas.toDataURL('image/png');
};

export const generateDebtCard = (debt: PersonalDebt): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  const width = 700;
  const height = 1000;
  canvas.width = width;
  canvas.height = height;
  
  const typeInfo = DEBT_TYPES[debt.type];
  const pending = debt.totalAmount - debt.paidAmount;
  const progress = (debt.paidAmount / debt.totalAmount) * 100;
  
  // Fondo
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#0f172a');
  gradient.addColorStop(1, '#1e293b');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  drawWatermark(ctx, width, height);
  drawElegantBorder(ctx, width, height, typeInfo.color);
  
  // Header
  const headerGradient = ctx.createLinearGradient(0, 0, width, 0);
  headerGradient.addColorStop(0, typeInfo.color);
  headerGradient.addColorStop(1, typeInfo.color + 'CC');
  ctx.fillStyle = headerGradient;
  drawRoundedRect(ctx, 30, 30, width - 60, 120, 15);
  ctx.fill();
  
  drawSeal(ctx, width - 80, 90, 35, typeInfo.color);
  
  ctx.font = 'bold 28px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText('FICHA DE DEUDA', width / 2, 80);
  
  ctx.font = 'bold 48px Arial';
  ctx.fillText(typeInfo.icon, width / 2, 180);
  
  ctx.font = 'bold 24px Arial';
  ctx.fillText(debt.name, width / 2, 220);
  
  let yPos = 280;
  
  // Tipo
  ctx.font = '16px Arial';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'left';
  ctx.fillText('Tipo:', 60, yPos);
  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = typeInfo.color;
  ctx.textAlign = 'right';
  ctx.fillText(typeInfo.label, width - 60, yPos);
  yPos += 50;
  
  // Montos
  ctx.fillStyle = '#1e293b';
  drawRoundedRect(ctx, 60, yPos, width - 120, 250, 15);
  ctx.fill();
  
  ctx.font = 'bold 18px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.fillText('Monto Total:', 80, yPos + 40);
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'right';
  ctx.fillText(`$${debt.totalAmount.toFixed(2)}`, width - 80, yPos + 40);
  
  ctx.font = 'bold 18px Arial';
  ctx.fillStyle = '#06b6d4';
  ctx.textAlign = 'left';
  ctx.fillText('Pago Mensual:', 80, yPos + 90);
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'right';
  ctx.fillText(`$${debt.monthlyPayment.toFixed(2)}`, width - 80, yPos + 90);
  
  ctx.font = 'bold 18px Arial';
  ctx.fillStyle = '#10b981';
  ctx.textAlign = 'left';
  ctx.fillText('Pagado:', 80, yPos + 140);
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'right';
  ctx.fillText(`$${debt.paidAmount.toFixed(2)}`, width - 80, yPos + 140);
  
  ctx.font = 'bold 18px Arial';
  ctx.fillStyle = '#ef4444';
  ctx.textAlign = 'left';
  ctx.fillText('Pendiente:', 80, yPos + 190);
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'right';
  ctx.fillText(`$${pending.toFixed(2)}`, width - 80, yPos + 190);
  
  yPos += 280;
  
  // Barra de progreso
  const progressGradient = ctx.createLinearGradient(60, 0, width - 60, 0);
  progressGradient.addColorStop(0, typeInfo.color);
  progressGradient.addColorStop(1, typeInfo.color + 'CC');
  ctx.fillStyle = progressGradient;
  drawRoundedRect(ctx, 60, yPos, (width - 120) * (progress / 100), 30, 15);
  ctx.fill();
  
  ctx.font = 'bold 16px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(`${progress.toFixed(1)}% Completado`, width / 2, yPos + 20);
  
  // Footer
  ctx.fillStyle = '#0f172a';
  drawRoundedRect(ctx, 30, height - 100, width - 60, 70, 15);
  ctx.fill();
  
  ctx.font = 'bold 14px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText('CONTROL DE ASISTENCIA - BALANCE PERSONAL', width / 2, height - 70);
  
  ctx.font = '12px Arial';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, width / 2, height - 50);
  
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
