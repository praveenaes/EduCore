const BACKEND_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace('/api/v1', '') ??
  'http://localhost:5000';

//making a photo a valid full URL so frontend can display image
export const getPhotoUrl = (photoPath?: string | null): string => {
  if (!photoPath) return '';
  if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
    return photoPath;
  }
  const cleanPath = photoPath.replace(/^\//, '');
  return `${BACKEND_URL}/${cleanPath}`;
};
