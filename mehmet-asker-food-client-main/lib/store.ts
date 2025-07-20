import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import foodSlice from './slices/foodSlice'
import cartSlice from './slices/cartSlice'
import paymentSlice from '../store/slices/paymentSlice'
import adminCategoryReducer from './slices/adminCategorySlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    food: foodSlice,
    cart: cartSlice,
    payment: paymentSlice,
    adminCategory: adminCategoryReducer
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector 