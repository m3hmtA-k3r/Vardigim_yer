import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password })
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token)
      }
      return response.data
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message)
      throw error
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ username, email, password, phone, addresses }: {
    username: string;
    email: string;
    password: string;
    phone?: string;
    addresses?: Array<{
      title: string;
      street: string;
      city: string;
      district: string;
      postalCode?: string;
      phone: string;
      isDefault: boolean;
    }>;
  }) => {
    const response = await axios.post(`${API_URL}/auth/register`, {
      username,
      email,
      password,
      phone,
      addresses
    })
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', response.data.token)
    }
    return response.data
  }
)

export const getUserProfile = createAsyncThunk(
  'auth/getUserProfile',
  async () => {
    if (typeof window === 'undefined') throw new Error('Not in browser')
    const token = localStorage.getItem('token')
    if (!token) throw new Error('No token found')

    const response = await axios.get(`${API_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  }
)
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData: { name: string; email: string; phone: string }) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    const data = await response.json();
    return data;
  }
); 

interface AuthState {
  user: any
  token: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isLoading: false,
  error: null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
      }
    },
    clearError: (state) => {
      state.error = null
    },
    setAuth: (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Giriş başarısız'
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Kayıt başarısız'
      })
      .addCase(getUserProfile.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.isAuthenticated = true
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.isLoading = false
        state.user = null
        state.token = null
        state.isAuthenticated = false
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
        }
      })
  },
})

export const { logout, clearError, setAuth } = authSlice.actions
export default authSlice.reducer 