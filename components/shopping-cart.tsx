"use client"

import type React from "react"

import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"

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
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        try {
          const items = JSON.parse(savedCart)
          items.forEach((item: CartItem) => {
            dispatch({ type: "ADD_ITEM", payload: item })
          })
        } catch (error) {
          console.error("Error loading cart from localStorage:", error)
        }
      }
    } else {
      loadSavedCart().catch((err) => {
        console.log("[v0] Failed to load saved cart, trying localStorage fallback")
        const savedCart = localStorage.getItem("cart")
        if (savedCart) {
          try {
            const items = JSON.parse(savedCart)
            items.forEach((item: CartItem) => {
              dispatch({ type: "ADD_ITEM", payload: item })
            })
          } catch (error) {
            console.error("Error loading cart from localStorage:", error)
          }
        }
      })
    }
  }, [user])

  useEffect(() => {
    if (state.items.length > 0) {
      localStorage.setItem("cart", JSON.stringify(state.items))
    } else {
      localStorage.removeItem("cart")
    }

    if (user && state.items.length > 0) {
      saveSavedCart()
    }
  }, [state.items, user])

  const loadSavedCart = async () => {
    if (!user) return

    try {
      dispatch({ type: "CLEAR_CART" })
      const { data, error } = await supabase
        .from("saved_carts")
        .select("product_id, quantity, products(id, name, price, image)")
        .eq("user_id", user.id)

      if (error) {
        console.log("[v0] Error loading saved cart, continuing with local cart")
        throw error
      }

      if (data && data.length > 0) {
        data.forEach((item: any) => {
          if (item.products) {
            dispatch({
              type: "ADD_ITEM",
              payload: {
                id: item.products.id,
                name: item.products.name,
                price: item.products.price,
                image: item.products.image,
              },
            })
            if (item.quantity > 1) {
              dispatch({
                type: "UPDATE_QUANTITY",
                payload: { id: item.products.id, quantity: item.quantity },
              })
            }
          }
        })
      }
    } catch (error) {
      console.log("[v0] Error loading saved cart:", error)
      throw error
    }
  }

  const saveSavedCart = async () => {
    if (!user) return

    try {
      const cartItems = state.items.map((item) => ({
        user_id: user.id,
        product_id: item.id,
        quantity: item.quantity,
      }))

      if (cartItems.length > 0) {
        const { error } = await supabase.from("saved_carts").upsert(cartItems, {
          onConflict: "user_id,product_id",
          ignoreDuplicates: false,
        })

        if (error) {
          console.log("[v0] Error saving cart:", error)
        }
        
        const productIds = cartItems.map((item) => `"${item.product_id}"`).join(",")
        const { error: deleteError } = await supabase
          .from("saved_carts")
          .delete()
          .eq("user_id", user.id)
          .not("product_id", "in", `(${productIds})`)

        if (deleteError) {
          console.log("[v0] Error removing stale cart items:", deleteError)
        }
      } else {
        await supabase.from("saved_carts").delete().eq("user_id", user.id)
      }
    } catch (error) {
      console.log("[v0] Error saving cart, cart will persist in localStorage only:", error)
    }
  }

  const addItem = async (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    const { quantity = 1, ...rest } = item

    try {
      const response = await fetch("/api/cart/validate-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: rest.id, quantity }),
      })

      if (!response.ok) {
        console.warn("Stock validation API returned error, allowing add to cart anyway")
        for (let i = 0; i < quantity; i++) {
          dispatch({ type: "ADD_ITEM", payload: rest })
        }
        return true
      }

      const validation = await response.json()

      if (!validation.available) {
        if (typeof window !== "undefined") {
          alert(validation.message || "This item is out of stock")
        }
        return false
      }

      for (let i = 0; i < quantity; i++) {
        dispatch({ type: "ADD_ITEM", payload: rest })
      }

      return true
    } catch (error) {
      console.error("Error adding item to cart:", error)
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
      const response = await fetch("/api/cart/validate-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: rest.id, quantity }),
      })

      if (!response.ok) {
        console.warn("Stock validation API returned error, allowing add to cart anyway")
        for (let i = 0; i < quantity; i++) {
          dispatch({ type: "ADD_ITEM", payload: rest })
        }
        return true
      }

      const validation = await response.json()

      if (!validation.available) {
        if (typeof window !== "undefined") {
          alert(validation.message || "This item is out of stock")
        }
        return false
      }

      for (let i = 0; i < quantity; i++) {
        dispatch({ type: "ADD_ITEM", payload: rest })
      }

      return true
    } catch (error) {
      console.error("Error adding item to cart:", error)
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
    state,
    dispatch,
  }
}
