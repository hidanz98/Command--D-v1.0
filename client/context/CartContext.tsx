import React, { createContext, useContext, useReducer, ReactNode, useEffect } from "react";

interface CartItem {
  id: string;
  name: string;
  category: string;
  pricePerDay: number;
  image: string;
  quantity: number;
  days: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

type CartAction =
  | {
      type: "ADD_ITEM";
      payload: Omit<CartItem, "quantity" | "days"> & { days?: number };
    }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "UPDATE_DAYS"; payload: { id: string; days: number } }
  | { type: "CLEAR_CART" };

const CartContext = createContext<
  | {
      state: CartState;
      dispatch: React.Dispatch<CartAction>;
    }
  | undefined
>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id,
      );

      if (existingItem) {
        const updatedItems = state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
        return {
          ...state,
          items: updatedItems,
          itemCount: state.itemCount + 1,
          total: calculateTotal(updatedItems),
        };
      } else {
        const newItem: CartItem = {
          ...action.payload,
          quantity: 1,
          days: action.payload.days || 1,
        };
        const updatedItems = [...state.items, newItem];
        return {
          ...state,
          items: updatedItems,
          itemCount: state.itemCount + 1,
          total: calculateTotal(updatedItems),
        };
      }
    }

    case "REMOVE_ITEM": {
      const updatedItems = state.items.filter(
        (item) => item.id !== action.payload,
      );
      return {
        ...state,
        items: updatedItems,
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        total: calculateTotal(updatedItems),
      };
    }

    case "UPDATE_QUANTITY": {
      const updatedItems = state.items
        .map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.max(0, action.payload.quantity) }
            : item,
        )
        .filter((item) => item.quantity > 0);

      return {
        ...state,
        items: updatedItems,
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        total: calculateTotal(updatedItems),
      };
    }

    case "UPDATE_DAYS": {
      const updatedItems = state.items.map((item) =>
        item.id === action.payload.id
          ? { ...item, days: Math.max(1, action.payload.days) }
          : item,
      );

      return {
        ...state,
        items: updatedItems,
        total: calculateTotal(updatedItems),
      };
    }

    case "CLEAR_CART":
      // Limpar também do localStorage
      localStorage.removeItem('cart');
      return {
        items: [],
        total: 0,
        itemCount: 0,
      };

    default:
      return state;
  }
}

function calculateTotal(items: CartItem[]): number {
  return items.reduce(
    (total, item) => total + item.pricePerDay * item.quantity * item.days,
    0,
  );
}

// Função para carregar o carrinho do localStorage
const loadCartFromStorage = (): CartState => {
  try {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      // Recalcular total para garantir consistência
      const total = parsedCart.items.reduce(
        (sum: number, item: CartItem) => sum + item.pricePerDay * item.quantity * item.days,
        0
      );
      return {
        ...parsedCart,
        total
      };
    }
  } catch (error) {
    console.error('Erro ao carregar carrinho do localStorage:', error);
  }
  
  return {
    items: [],
    total: 0,
    itemCount: 0,
  };
};

// Função para salvar o carrinho no localStorage
const saveCartToStorage = (cartState: CartState) => {
  try {
    localStorage.setItem('cart', JSON.stringify(cartState));
  } catch (error) {
    console.error('Erro ao salvar carrinho no localStorage:', error);
  }
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, loadCartFromStorage());
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Debug logs
  useEffect(() => {
    console.log("CartProvider mounted");
    console.log("Initial cart state:", state);
    console.log("Is initialized:", isInitialized);
  }, []);

  // Marcar como inicializado após o primeiro render
  useEffect(() => {
    console.log("CartProvider initializing...");
    setIsInitialized(true);
    
    // Log se o carrinho foi restaurado (sem notificação para evitar conflitos)
    if (state.items.length > 0) {
      console.log("Cart restored with items:", state.items);
      console.log(`Carrinho restaurado com ${state.itemCount} item(s) - Total: R$ ${state.total.toFixed(2)}`);
    }
  }, []);

  // Salvar no localStorage sempre que o estado mudar (após inicialização)
  useEffect(() => {
    if (isInitialized) {
      console.log("Saving cart to storage:", state);
      saveCartToStorage(state);
    }
  }, [state, isInitialized]);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

export type { CartItem };
