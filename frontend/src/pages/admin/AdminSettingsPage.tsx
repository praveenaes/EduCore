import React, { useEffect, useState, useRef } from "react";
import { SettingsCard } from "../../components/settings/SettingsCard";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { PasswordChangeModal } from "../../components/settings/PasswordChangeModal";
import { ChangeEmailModal } from "../../components/settings/ChangeEmailModal";
import { Building2, KeyRound, Mail, Camera, Trash2, CheckCircle2 } from "lucide-react";
import {
  getOrganizationSettingsApi,
  updateOrganizationSettingsApi,
} from "../../api/settingsApi";
import { useAppDispatch } from "../../app/hooks";
import { setOrganization } from "../../app/slices/organizationSlice";

export const AdminSettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modals state
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);

  // Form states
  const [orgName, setOrgName] = useState("");
  const [orgLogo, setOrgLogo] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Status states
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setFetching(true);
    setApiError(null);
    try {
      const response = await getOrganizationSettingsApi();
      setOrgName(response.data.name);
      setOrgLogo(response.data.logoPath || "");
      dispatch(setOrganization(response.data));
    } catch (err) {
      console.error(err);
      setApiError("Failed to load organization settings.");
    } finally {
      setFetching(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOrgName(value);

    // Validate organization name (only letters and spaces)
    if (value.trim() === "") {
      setNameError("Organization name is required");
    } else if (!/^[a-zA-Z\s]+$/.test(value)) {
      setNameError("Organization name must contain only letters and spaces");
    } else {
      setNameError(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setOrgLogo("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nameError || orgName.trim() === "") return;

    setLoading(true);
    setApiError(null);
    setApiSuccess(null);

    const formData = new FormData();
    formData.append("name", orgName.trim());

    if (logoFile) {
      formData.append("logo", logoFile);
    } else if (orgLogo === "") {
      formData.append("removeLogo", "true");
    }

    try {
      const response = await updateOrganizationSettingsApi(formData);
      dispatch(setOrganization(response.data));
      setOrgLogo(response.data.logoPath || "");
      setLogoFile(null);
      setLogoPreview(null);
      setApiSuccess("Branding settings saved successfully.");
      setTimeout(() => {
        setApiSuccess(null);
      }, 3000);
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Failed to save organization settings.";
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

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-800">Settings</h1>
        <p className="text-sm text-neutral-500">
          Manage system-wide organization branding, email configurations, and account security.
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

      {/* Organization Branding Section */}
      <SettingsCard
        title="Organization Branding"
        description="Update your school's name and official logo displayed on the portal headers."
        icon={Building2}
      >
        <form onSubmit={handleSaveBranding} className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-neutral-100">
            {/* Logo box */}
            <div className="relative h-24 w-24 rounded-lg border border-neutral-200 bg-neutral-50 flex items-center justify-center overflow-hidden">
              {logoPreview || orgLogo ? (
                <img
                  src={logoPreview || orgLogo}
                  alt="School Logo"
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <span className="text-2xl font-bold text-neutral-300">LOGO</span>
              )}
            </div>

            {/* Logo Actions */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-neutral-700">School Logo</label>
              <div className="flex flex-wrap gap-2">
                {!(logoPreview || orgLogo) ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                  >
                    <Camera className="mr-1.5 h-4 w-4" />
                    Upload New
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={handleRemoveLogo}
                    disabled={loading}
                  >
                    <Trash2 className="mr-1.5 h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-xs text-neutral-400">
                Supported formats: PNG, JPG, JPEG, WEBP. Maximum file size: 2MB.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="max-w-md">
            <Input
              label="Organization Name"
              type="text"
              value={orgName}
              onChange={handleNameChange}
              error={nameError || undefined}
              disabled={loading}
              placeholder="e.g. EduCore Academy"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" variant="primary" disabled={loading || !!nameError}>
              {loading ? "Saving Branding..." : "Save Branding"}
            </Button>
          </div>
        </form>
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
                Change your primary administrative login email. Requires OTP validation.
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
export default AdminSettingsPage;
