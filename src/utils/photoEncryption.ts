// Simple encryption/decryption for photo storage
// Uses XOR cipher with a key derived from a passphrase

const ENCRYPTION_KEY = 'asistencia_hl_2024_secure_key';

export function encryptPhoto(base64Data: string): string {
  try {
    // Convert base64 to binary string
    const binaryString = atob(base64Data.split(',')[1] || base64Data);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // XOR encryption with key
    const keyBytes = new TextEncoder().encode(ENCRYPTION_KEY);
    const encrypted = new Uint8Array(bytes.length);
    
    for (let i = 0; i < bytes.length; i++) {
      encrypted[i] = bytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    // Convert to base64 for storage
    const encryptedString = String.fromCharCode(...encrypted);
    return 'ENC:' + btoa(encryptedString);
  } catch (error) {
    console.error('Error encrypting photo:', error);
    return '';
  }
}

export function decryptPhoto(encryptedData: string): string {
  try {
    if (!encryptedData || !encryptedData.startsWith('ENC:')) {
      return encryptedData; // Return as-is if not encrypted
    }
    
    const encryptedBase64 = encryptedData.substring(4);
    const encryptedString = atob(encryptedBase64);
    const encryptedBytes = new Uint8Array(encryptedString.length);
    
    for (let i = 0; i < encryptedString.length; i++) {
      encryptedBytes[i] = encryptedString.charCodeAt(i);
    }
    
    // XOR decryption with same key
    const keyBytes = new TextEncoder().encode(ENCRYPTION_KEY);
    const decrypted = new Uint8Array(encryptedBytes.length);
    
    for (let i = 0; i < encryptedBytes.length; i++) {
      decrypted[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    // Convert back to base64 image
    const binaryString = String.fromCharCode(...decrypted);
    return 'data:image/jpeg;base64,' + btoa(binaryString);
  } catch (error) {
    console.error('Error decrypting photo:', error);
    return '';
  }
}

export function compressAndEncodeImage(file: File, maxWidth = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Resize if needed
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with compression
        const base64 = canvas.toDataURL('image/jpeg', quality);
        resolve(base64);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
