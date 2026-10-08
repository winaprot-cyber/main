export const generateExpenseCard = (expense: any): string => {
  return `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect fill="#1e293b" width="400" height="200"/><text x="200" y="100" text-anchor="middle" fill="white" font-size="20">${expense.name}</text></svg>`)}`;
};

export const generateDebtCard = (debt: any): string => {
  return `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect fill="#1e293b" width="400" height="200"/><text x="200" y="100" text-anchor="middle" fill="white" font-size="20">${debt.name}</text></svg>`)}`;
};

export const generatePaymentReceipt = (type: string, name: string, amount: number): string => {
  return `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect fill="#1e293b" width="400" height="200"/><text x="200" y="100" text-anchor="middle" fill="white" font-size="20">${name} - $${amount}</text></svg>`)}`;
};

export const downloadCard = (dataUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.click();
};

export const shareCardWhatsApp = (dataUrl: string, title: string) => {
  const message = encodeURIComponent(`${title}\n\nCompartido desde Control de Asistencia HL`);
  window.open(`https://wa.me/?text=${message}`, '_blank');
};
