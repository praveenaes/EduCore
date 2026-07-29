import React, { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { ConfirmationModal } from "../ConfirmationModal";

interface ProfilePhotoUploaderProps {
  currentPhotoPath?: string;
  displayName: string;
  onUpload: (file: File) => Promise<void>;
  onRemove?: () => Promise<void>;
  disabled?: boolean;
}

export const ProfilePhotoUploader: React.FC<ProfilePhotoUploaderProps> = ({
  currentPhotoPath,
  displayName,
  onUpload,
  onRemove,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const photoUrl = previewUrl || currentPhotoPath || null;
  const initial = displayName.charAt(0).toUpperCase();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    setUploading(true);
    try {
      await onUpload(file);
    } catch {
      // Revert preview on failure
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Photo Circle */}
      <button
        type="button"
        disabled={disabled || uploading}
        onClick={() => fileInputRef.current?.click()}
        className="group relative h-28 w-28 rounded-full border-2 border-dashed border-neutral-200 bg-neutral-50 transition-all duration-200 hover:border-brand-400 hover:bg-brand-50/30 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={displayName}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <span className="text-3xl font-bold text-neutral-300">{initial}</span>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-neutral-900/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </div>
      </button>

      <div className="flex flex-col items-center gap-1.5">
        <p className="text-xs text-neutral-400">
          {uploading ? "Uploading..." : "Click to upload photo"}
        </p>
        {currentPhotoPath && onRemove && (
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => setShowConfirm(true)}
            className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors duration-150 cursor-pointer"
          >
            Remove Photo
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {currentPhotoPath && onRemove && (
        <ConfirmationModal
          isOpen={showConfirm}
          title="Remove Profile Photo?"
          message={`Are you sure you want to remove your profile photo?\nThis action cannot be undone.`}
          confirmText="Remove"
          cancelText="Cancel"
          onConfirm={async () => {
            setUploading(true);
            try {
              await onRemove();
              setPreviewUrl(null);
              setShowConfirm(false);
            } catch {
              // Ignore
            } finally {
              setUploading(false);
            }
          }}
          onCancel={() => setShowConfirm(false)}
          loading={uploading}
        />
      )}
    </div>
  );
};
