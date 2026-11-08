import { useCallback } from 'react';

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: {
    ondismiss?: () => void;
  };
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const useRazorpay = () => {
  const displayRazorpay = useCallback(
    async (
      orderData: {
        keyId: string;
        orderId: string;
        amount: number;
        currency: string;
        title: string;
        payerName?: string;
        payerEmail?: string;
        payerPhone?: string;
      },
      onSuccess: (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => void,
      onFailure?: (error?: any) => void
    ) => {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        if (onFailure) {
          onFailure(
            new Error('Failed to load Razorpay checkout SDK. Check your internet connection.')
          );
        }
        return;
      }

      const options: RazorpayCheckoutOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Educore',
        description: orderData.title,
        order_id: orderData.orderId,
        handler: (response) => {
          if (onSuccess) onSuccess(response);
        },
        modal: {
          ondismiss: () => {
            if (onFailure) onFailure(new Error('Payment window closed by user.'));
          },
        },
        prefill: {
          name: orderData.payerName,
          email: orderData.payerEmail,
          contact: orderData.payerPhone,
        },
        theme: {
          color: '#4f46e5',
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    },
    []
  );

  return { displayRazorpay };
};

export default useRazorpay;
