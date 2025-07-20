import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface PaymentIntentRequest {
  amount: number;
  items: Array<{
    food: string;
    quantity: number;
    price: number;
  }>;
  deliveryAddress: {
    street: string;
    city: string;
    district: string;
    postalCode?: string;
    phone: string;
  };
  currency?: string;
}

interface PaymentState {
  clientSecret: string | null;
  paymentIntentId: string | null;
  isLoading: boolean;
  error: string | null;
  paymentStatus: 'idle' | 'processing' | 'succeeded' | 'failed';
}

const initialState: PaymentState = {
  clientSecret: null,
  paymentIntentId: null,
  isLoading: false,
  error: null,
  paymentStatus: 'idle',
};

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const createPaymentIntent = createAsyncThunk(
  'payment/createPaymentIntent',
  async (data: PaymentIntentRequest, { rejectWithValue }) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      const response = await fetch(`${API_URL}/payment/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Payment intent oluşturulamadı');
      }

      const responseData = await response.json();
      return responseData;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const confirmPayment = createAsyncThunk(
  'payment/confirmPayment',
  async (paymentIntentId: string, { rejectWithValue }) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      const response = await fetch(`${API_URL}/payment/confirm-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentIntentId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Ödeme doğrulanamadı');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    resetPayment: (state) => {
      state.clientSecret = null;
      state.paymentIntentId = null;
      state.error = null;
      state.paymentStatus = 'idle';
    },
    setPaymentStatus: (state, action) => {
      state.paymentStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPaymentIntent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.clientSecret = action.payload.clientSecret;
        state.paymentIntentId = action.payload.paymentIntentId;
        state.paymentStatus = 'processing';
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.paymentStatus = 'failed';
      })
      .addCase(confirmPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(confirmPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.paymentStatus === 'succeeded') {
          state.paymentStatus = 'succeeded';
        } else {
          state.paymentStatus = 'failed';
        }
      })
      .addCase(confirmPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.paymentStatus = 'failed';
      });
  },
});

export const { resetPayment, setPaymentStatus } = paymentSlice.actions;
export default paymentSlice.reducer; 