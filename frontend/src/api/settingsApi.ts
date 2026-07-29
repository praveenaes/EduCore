import { axiosInstance } from "./axiosInstance";
import type { OrganizationSettings, MySettingsResponse } from "../types/settings";

export const getOrganizationSettingsApi = async (): Promise<{ success: boolean; data: OrganizationSettings }> => {
  const response = await axiosInstance.get<{ success: boolean; data: OrganizationSettings }>("/settings/organization");
  return response.data;
};

export const updateOrganizationSettingsApi = async (
  formData: FormData
): Promise<{ success: boolean; message: string; data: OrganizationSettings }> => {
  const response = await axiosInstance.put<{ success: boolean; message: string; data: OrganizationSettings }>(
    "/settings/organization",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const getMySettingsApi = async (): Promise<{ success: boolean; data: MySettingsResponse }> => {
  const response = await axiosInstance.get<{ success: boolean; data: MySettingsResponse }>("/settings/profile");
  return response.data;
};

export const updateMyProfilePhotoApi = async (
  formData: FormData
): Promise<{ success: boolean; message: string; data: { photoPath: string } }> => {
  const response = await axiosInstance.patch<{ success: boolean; message: string; data: { photoPath: string } }>(
    "/settings/profile",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const changePasswordApi = async (
  payload: any
): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.post<{ success: boolean; message: string }>("/settings/change-password", payload);
  return response.data;
};

export const sendEmailChangeOtpApi = async (): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.post<{ success: boolean; message: string }>("/settings/change-email/send-otp");
  return response.data;
};

export const verifyEmailChangeOtpApi = async (
  otp: string
): Promise<{ success: boolean; message: string; data: { emailChangeToken: string } }> => {
  const response = await axiosInstance.post<{ success: boolean; message: string; data: { emailChangeToken: string } }>(
    "/settings/change-email/verify-otp",
    { otp }
  );
  return response.data;
};

export const changeEmailApi = async (
  payload: any
): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.post<{ success: boolean; message: string }>("/settings/change-email/update", payload);
  return response.data;
};
