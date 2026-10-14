export const encryptPhoto = (data: string): string => {
  return btoa(encodeURIComponent(data));
};

export const decryptPhoto = (data: string): string => {
  try {
    return decodeURIComponent(atob(data));
  } catch {
    return '';
  }
};

export const compressAndEncodeImage = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsDataURL(file);
  });
};
