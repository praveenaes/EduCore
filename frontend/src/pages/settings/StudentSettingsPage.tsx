import React, { useEffect, useState } from "react";
import { SettingsCard } from "../../components/settings/SettingsCard";
import { ProfilePhotoUploader } from "../../components/settings/ProfilePhotoUploader";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { PasswordChangeModal } from "../../components/settings/PasswordChangeModal";
import { ChangeEmailModal } from "../../components/settings/ChangeEmailModal";
import { User, KeyRound, Mail, CheckCircle2 } from "lucide-react";
import { getMySettingsApi, updateMyProfilePhotoApi } from "../../api/settingsApi";
import { useAppDispatch } from "../../app/hooks";
import { updateUserProfilePhoto } from "../../app/slices/authSlice";
import type { MySettingsResponse } from "../../types/settings";

export const StudentSettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [data, setData] = useState<MySettingsResponse | null>(null);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);

  // Modals
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);

  useEffect(() => {
    fetchProfileSettings();
  }, []);

  const fetchProfileSettings = async () => {
    setFetching(true);
    setApiError(null);
    try {
      const response = await getMySettingsApi();
      setData(response.data);
    } catch (err) {
      console.error(err);
      setApiError("Failed to load profile settings.");
    } finally {
      setFetching(false);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    setLoading(true);
    setApiError(null);
    setApiSuccess(null);
    const formData = new FormData();
    formData.append("photo", file);

    try {
      const response = await updateMyProfilePhotoApi(formData);
      dispatch(updateUserProfilePhoto(response.data.photoPath));
      setApiSuccess("Profile photo uploaded successfully.");
      setTimeout(() => {
        setApiSuccess(null);
      }, 3000);
      // Refresh profile data
      await fetchProfileSettings();
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Failed to upload photo.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoRemove = async () => {
    setLoading(true);
    setApiError(null);
    setApiSuccess(null);
    const formData = new FormData();
    formData.append("removePhoto", "true");

    try {
      await updateMyProfilePhotoApi(formData);
      dispatch(updateUserProfilePhoto(""));
      setApiSuccess("Profile photo removed successfully.");
      setTimeout(() => {
        setApiSuccess(null);
      }, 3000);
      // Refresh profile data
      await fetchProfileSettings();
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Failed to remove photo.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  const profileName = data?.user?.name || "Student";
  const currentPhoto = data?.profile?.photo || "";

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-800">Settings</h1>
        <p className="text-sm text-neutral-500">
          Manage your personal profile photo, account email address, and security password.
        </p>
      </div>

      {apiSuccess && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700 border border-green-200 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{apiSuccess}</span>
        </div>
      )}

      {apiError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
          {apiError}
        </div>
      )}

      {/* Profile Info & Photo Section */}
      <SettingsCard
        title="Personal Profile"
        description="View your institutional student profile and update your public profile avatar."
        icon={User}
      >
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-1/3 flex flex-col items-center py-4 border-r border-neutral-100 pr-0 md:pr-8">
            <ProfilePhotoUploader
              currentPhotoPath={currentPhoto}
              displayName={profileName}
              onUpload={handlePhotoUpload}
              onRemove={handlePhotoRemove}
              disabled={loading}
            />
          </div>

          <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              type="text"
              value={data?.profile?.firstName || ""}
              disabled
            />
            <Input
              label="Last Name"
              type="text"
              value={data?.profile?.lastName || ""}
              disabled
            />
            <Input
              label="Admission Number"
              type="text"
              value={data?.profile?.admissionNumber || ""}
              disabled
            />
            <Input
              label="Institutional Email"
              type="text"
              value={data?.profile?.email || ""}
              disabled
            />
            <Input
              label="Contact Phone"
              type="text"
              value={data?.profile?.phone || ""}
              disabled
            />
          </div>
        </div>
      </SettingsCard>

      {/* Account Security Settings */}
      <SettingsCard
        title="Account & Security"
        description="Update your sign-in email address or change your password to keep your account secure."
        icon={KeyRound}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-neutral-100 p-5 space-y-3 bg-neutral-50/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-neutral-800">Email Address</h4>
              <p className="text-xs text-neutral-500 mt-0.5">
                Change your primary login email. Requires OTP validation.
              </p>
            </div>
            <div className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEmailOpen(true)}>
                Change Email Address
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-100 p-5 space-y-3 bg-neutral-50/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-neutral-800">Password</h4>
              <p className="text-xs text-neutral-500 mt-0.5">
                Update your account password. Requires your current password to verify identity.
              </p>
            </div>
            <div className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsPasswordOpen(true)}>
                Change Account Password
              </Button>
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* Change Password Modal */}
      <PasswordChangeModal isOpen={isPasswordOpen} onClose={() => setIsPasswordOpen(false)} />

      {/* Change Email Modal */}
      <ChangeEmailModal isOpen={isEmailOpen} onClose={() => setIsEmailOpen(false)} />
    </div>
  );
};
export default StudentSettingsPage;
