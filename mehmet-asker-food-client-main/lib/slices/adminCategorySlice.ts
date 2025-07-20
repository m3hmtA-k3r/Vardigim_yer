import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
const API_URL_ENV = process.env.NEXT_PUBLIC_API_URL

const API_URL = `${API_URL_ENV}/admin/categories`

interface Category {
  _id: string
  name: string
  description: string
  image: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface CategoryState {
  categories: Category[]
  isLoading: boolean
  error: string | null
  selectedCategory: Category | null
}

export const fetchAdminCategories = createAsyncThunk(
  'adminCategory/fetchCategories',
  async () => {
    const token = localStorage.getItem('token')
    const response = await axios.get(`${API_URL}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data.categories
  }
)

export const createCategory = createAsyncThunk(
  'adminCategory/createCategory',
  async (categoryData: any) => {
    const token = localStorage.getItem('token')
    const response = await axios.post(`${API_URL}`, categoryData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    return response.data.category
  }
)

export const updateCategory = createAsyncThunk(
  'adminCategory/updateCategory',
  async ({ id, data }: { id: string, data: any }) => {
    const token = localStorage.getItem('token')
    const response = await axios.put(`${API_URL}/${id}`, data, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    return response.data.category
  }
)

export const deleteCategory = createAsyncThunk(
  'adminCategory/deleteCategory',
  async (id: string) => {
    const token = localStorage.getItem('token')
    await axios.delete(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return id
  }
)

const initialState: CategoryState = {
  categories: [],
  isLoading: false,
  error: null,
  selectedCategory: null
}

const adminCategorySlice = createSlice({
  name: 'adminCategory',
  initialState,
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload
    },
    clearSelectedCategory: (state) => {
      state.selectedCategory = null
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminCategories.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAdminCategories.fulfilled, (state, action) => {
        state.isLoading = false
        state.categories = action.payload
      })
      .addCase(fetchAdminCategories.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Kategoriler yüklenemedi'
      })
      .addCase(createCategory.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isLoading = false
        state.categories.unshift(action.payload)
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Kategori oluşturulamadı'
      })
      .addCase(updateCategory.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.isLoading = false
        state.categories = state.categories.map(category =>
          category._id === action.payload._id ? action.payload : category
        )
        state.selectedCategory = null
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Kategori güncellenemedi'
      })
      .addCase(deleteCategory.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.isLoading = false
        state.categories = state.categories.filter(
          category => category._id !== action.payload
        )
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Kategori silinemedi'
      })
  }
})

export const { 
  setSelectedCategory, 
  clearSelectedCategory,
  clearError 
} = adminCategorySlice.actions

export default adminCategorySlice.reducer 