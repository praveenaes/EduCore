const BACKEND_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace('/api/v1', '') ??
  'http://localhost:5000';

/**
 * Normalizes a photo path from the backend and returns the full static image URL.
 * Handles both absolute-looking paths (e.g. '/uploads/...') and relative paths (e.g. 'uploads/...').
 */
export const getPhotoUrl = (photoPath?: string | null): string => {
  if (!photoPath) return '';
  if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
    return photoPath;
  }
  const cleanPath = photoPath.replace(/^\//, '');
  return `${BACKEND_URL}/${cleanPath}`;
};
