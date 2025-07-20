import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const fetchCategories = createAsyncThunk(
  'food/fetchCategories',
  async () => {
    const response = await axios.get(`${API_URL}/foods/categories`)
    return response.data.categories
  }
)

export const fetchFoods = createAsyncThunk(
  'food/fetchFoods',
  async (categoryId?: string) => {
    const url = categoryId 
      ? `${API_URL}/foods?category=${categoryId}`
      : `${API_URL}/foods`
    const response = await axios.get(url)
    return response.data.foods
  }
)

export const fetchPopularFoods = createAsyncThunk(
  'food/fetchPopularFoods',
  async () => {
    const response = await axios.get(`${API_URL}/foods/popular`)
    return response.data.foods || response.data
  }
)

interface FoodState {
  categories: any[]
  foods: any[]
  popularFoods: any[]
  selectedCategory: string | null
  isLoading: boolean
  error: string | null
}

const initialState: FoodState = {
  categories: [],
  foods: [],
  popularFoods: [],
  selectedCategory: null,
  isLoading: false,
  error: null,
}

const foodSlice = createSlice({
  name: 'food',
  initialState,
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false
        state.categories = action.payload
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Kategoriler yüklenemedi'
      })
      .addCase(fetchFoods.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchFoods.fulfilled, (state, action) => {
        state.isLoading = false
        state.foods = action.payload
      })
      .addCase(fetchFoods.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Yemekler yüklenemedi'
      })
      .addCase(fetchPopularFoods.fulfilled, (state, action) => {
        state.popularFoods = action.payload
      })
  },
})

export const { setSelectedCategory, clearError } = foodSlice.actions
export default foodSlice.reducer 