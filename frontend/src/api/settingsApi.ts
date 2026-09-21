import { axiosInstance } from "./axiosInstance";
import { API_ROUTES } from "./apiRoutes";
import type { OrganizationSettings, MySettingsResponse } from "../types/settings";

export const getOrganizationSettingsApi = async (): Promise<{ success: boolean; data: OrganizationSettings }> => {
  const response = await axiosInstance.get<{ success: boolean; data: OrganizationSettings }>(API_ROUTES.SETTINGS.ORGANIZATION);
  return response.data;
};

export const updateOrganizationSettingsApi = async (
  formData: FormData
): Promise<{ success: boolean; message: string; data: OrganizationSettings }> => {
  const response = await axiosInstance.put<{ success: boolean; message: string; data: OrganizationSettings }>(
    API_ROUTES.SETTINGS.ORGANIZATION,
    formData
  );
  return response.data;
};

export const getMySettingsApi = async (): Promise<{ success: boolean; data: MySettingsResponse }> => {
  const response = await axiosInstance.get<{ success: boolean; data: MySettingsResponse }>(API_ROUTES.SETTINGS.PROFILE);
  return response.data;
};

export const updateMyProfilePhotoApi = async (
  formData: FormData
): Promise<{ success: boolean; message: string; data: { photoPath: string } }> => {
  const response = await axiosInstance.patch<{ success: boolean; message: string; data: { photoPath: string } }>(
    API_ROUTES.SETTINGS.PROFILE,
    formData
  );
  return response.data;
};

export const changePasswordApi = async (
  payload: any
): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.post<{ success: boolean; message: string }>(API_ROUTES.SETTINGS.CHANGE_PASSWORD, payload);
  return response.data;
};

export const sendEmailChangeOtpApi = async (): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.post<{ success: boolean; message: string }>(API_ROUTES.SETTINGS.SEND_EMAIL_OTP);
  return response.data;
};

export const verifyEmailChangeOtpApi = async (
  otp: string
): Promise<{ success: boolean; message: string; data: { emailChangeToken: string } }> => {
  const response = await axiosInstance.post<{ success: boolean; message: string; data: { emailChangeToken: string } }>(
    API_ROUTES.SETTINGS.VERIFY_EMAIL_OTP,
    { otp }
  );
  return response.data;
};

export const changeEmailApi = async (
  payload: any
): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.post<{ success: boolean; message: string }>(API_ROUTES.SETTINGS.UPDATE_EMAIL, payload);
  return response.data;
};
