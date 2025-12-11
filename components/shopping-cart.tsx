"use client"

import type React from "react"

import { createContext, useContext, useReducer, type ReactNode } from "react"

interface CartItem {
  id: string
  name: string
  price: string
  image: string
  quantity: number
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity"> }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "TOGGLE_CART" }
  | { type: "CLEAR_CART" }

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
} | null>(null)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM":
      const existingItem = state.items.find((item) => item.id === action.payload.id)
      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        }
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
      }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      }
    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item,
        ),
      }
    case "TOGGLE_CART":
      return {
        ...state,
        isOpen: !state.isOpen,
      }
    case "CLEAR_CART":
      return {
        ...state,
        items: [],
      }
    default:
      return state
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
  })

  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }

  const { state, dispatch } = context

  const addItem = async (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    const { quantity = 1, ...rest } = item

    try {
      // Validate stock availability
      const response = await fetch("/api/cart/validate-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: rest.id, quantity }),
      })

      if (!response.ok) {
        console.warn("Stock validation API returned error, allowing add to cart anyway")
        // If API fails, allow adding to cart (degraded experience rather than blocked)
        for (let i = 0; i < quantity; i++) {
          dispatch({ type: "ADD_ITEM", payload: rest })
        }
        return true
      }

      const validation = await response.json()

      if (!validation.available) {
        // Show stock error message
        if (typeof window !== "undefined") {
          alert(validation.message || "This item is out of stock")
        }
        return false
      }

      // Add items one by one to maintain count
      for (let i = 0; i < quantity; i++) {
        dispatch({ type: "ADD_ITEM", payload: rest })
      }

      return true
    } catch (error) {
      console.error("Error adding item to cart:", error)
      // On network error, allow adding anyway (fallback behavior)
      console.warn("Failed to validate stock, adding to cart anyway")
      for (let i = 0; i < quantity; i++) {
        dispatch({ type: "ADD_ITEM", payload: rest })
      }
      return true
    }
  }

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id })
  }

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
  }

  const toggleCart = () => {
    dispatch({ type: "TOGGLE_CART" })
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
  }

  return {
    items: state.items,
    isOpen: state.isOpen,
    addItem,
    removeItem,
    updateQuantity,
    toggleCart,
    clearCart,
    // Keep dispatch for backward compatibility
    state,
    dispatch,
  }
}
