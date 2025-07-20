import { createSlice } from '@reduxjs/toolkit'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  isDiscount?: boolean
  discount?: number
  discountPrice?: number
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
}

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { id, name, price, image, isDiscount, discount, discountPrice } = action.payload
      const existingItem = state.items.find(item => item.id === id)

      if (existingItem) {
        existingItem.quantity += 1
      } else {
        state.items.push({ id, name, price, quantity: 1, image, isDiscount, discount, discountPrice })
      }

      state.total = state.items.reduce((sum, item) => {
        const itemPrice = item.isDiscount && item.discountPrice ? item.discountPrice : item.price
        return sum + (itemPrice * item.quantity)
      }, 0)
      state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)
    },
    removeFromCart: (state, action) => {
      const id = action.payload
      state.items = state.items.filter(item => item.id !== id)
      state.total = state.items.reduce((sum, item) => {
        const itemPrice = item.isDiscount && item.discountPrice ? item.discountPrice : item.price
        return sum + (itemPrice * item.quantity)
      }, 0)
      state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload
      const item = state.items.find(item => item.id === id)

      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(item => item.id !== id)
        } else {
          item.quantity = quantity
        }
      }

      state.total = state.items.reduce((sum, item) => {
        const itemPrice = item.isDiscount && item.discountPrice ? item.discountPrice : item.price
        return sum + (itemPrice * item.quantity)
      }, 0)
      state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)
    },
    clearCart: (state) => {
      state.items = []
      state.total = 0
      state.itemCount = 0
    }
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions
export default cartSlice.reducer 