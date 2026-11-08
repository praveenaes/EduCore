import { API_ROUTES } from '../api/apiRoutes';
import axiosInstance from '../api/axiosInstance';
import type {
  ConfirmFeePaymentPayload,
  ConfirmFeePaymentResponse,
  CreateFeeAssignmentPayload,
  CreateFeeAssignmentResponse,
  FeeFilterParams,
  FeeListResponse,
  InitFeePaymentResponse,
  PaymentLedgerFilterParams,
  PaymentLedgerResponse,
} from '../types/fee';

export const getFeesApi = (params?: FeeFilterParams) =>
  axiosInstance.get<FeeListResponse>(API_ROUTES.FEES.BASE, { params });

export const createFeeAssignmentsApi = (payload: CreateFeeAssignmentPayload) =>
  axiosInstance.post<CreateFeeAssignmentResponse>(API_ROUTES.FEES.BASE, payload);

export const initFeePaymentApi = (feeAssignmentId: string) =>
  axiosInstance.post<InitFeePaymentResponse>(API_ROUTES.FEES.INIT_PAYMENT(feeAssignmentId));

export const confirmFeePaymentApi = (
  feeAssignmentId: string,
  payload: ConfirmFeePaymentPayload
) =>
  axiosInstance.post<ConfirmFeePaymentResponse>(
    API_ROUTES.FEES.CONFIRM_PAYMENT(feeAssignmentId),
    payload
  );

export const getPaymentLedgerApi = (params?: PaymentLedgerFilterParams) =>
  axiosInstance.get<PaymentLedgerResponse>(API_ROUTES.FEES.TRANSACTIONS, { params });

export const refundFeePaymentApi = (
  paymentId: string,
  payload?: { reason?: string; amount?: number }
) =>
  axiosInstance.post(API_ROUTES.FEES.REFUND_PAYMENT(paymentId), payload);

export const requestFeeRefundApi = (
  feeAssignmentId: string,
  payload: { reason: string }
) =>
  axiosInstance.post(API_ROUTES.FEES.REQUEST_REFUND(feeAssignmentId), payload);

export const rejectFeeRefundApi = (
  paymentId: string,
  payload?: { remarks?: string }
) =>
  axiosInstance.post(API_ROUTES.FEES.REJECT_REFUND(paymentId), payload);
