export const openAttachment = (fileUrl: string, _fileName?: string) => {
  if (!fileUrl) return;

  // If it's a regular web URL, open directly
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
    return;
  }

  // If it's a data: URL (Base64)
  if (fileUrl.startsWith('data:')) {
    try {
      const parts = fileUrl.split(',');
      const mime = parts[0].match(/:(.*?);/)?.[1] || 'application/pdf';
      const byteCharacters = atob(parts[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      // Revoke the blob URL after a minute to prevent memory leaks
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      return;
    } catch (e) {
      console.error('Error opening base64 file:', e);
    }
  }

  window.open(fileUrl, '_blank');
};
