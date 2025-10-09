import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface Category {
  id: string;
  name: string;
  description?: string;
  order: number;
  showInEcommerce: boolean;
  subcategories: Subcategory[];
  createdAt: string;
  updatedAt: string;
}

export interface Subcategory {
  id: string;
  name: string;
  description?: string;
  order: number;
  showInEcommerce: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CategoryContextType {
  categories: Category[];
  addCategory: (
    category: Omit<Category, "id" | "createdAt" | "updatedAt">,
  ) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addSubcategory: (
    categoryId: string,
    subcategory: Omit<Subcategory, "id" | "createdAt" | "updatedAt">,
  ) => void;
  updateSubcategory: (
    categoryId: string,
    subcategoryId: string,
    subcategory: Partial<Subcategory>,
  ) => void;
  deleteSubcategory: (categoryId: string, subcategoryId: string) => void;
  reorderCategories: (categoryId: string, direction: "up" | "down") => void;
  reorderSubcategories: (
    categoryId: string,
    subcategoryId: string,
    direction: "up" | "down",
  ) => void;
  getActiveCategories: () => Category[];
  getActiveSubcategories: (categoryId: string) => Subcategory[];
}

const CategoryContext = createContext<CategoryContextType | undefined>(
  undefined,
);

const INITIAL_CATEGORIES: Category[] = [
  {
    id: "1",
    name: "Câmeras",
    description: "Equipamentos de gravação e filmagem",
    order: 1,
    showInEcommerce: true,
    subcategories: [
      {
        id: "1.1",
        name: "Câmeras de Cinema",
        description: "Câmeras profissionais para cinema",
        order: 1,
        showInEcommerce: true,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      },
      {
        id: "1.2",
        name: "Câmeras Híbridas",
        description: "Câmeras para foto e vídeo",
        order: 2,
        showInEcommerce: true,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      },
    ],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "2",
    name: "Lentes",
    description: "Objetivas e lentes para diferentes aplicações",
    order: 2,
    showInEcommerce: true,
    subcategories: [
      {
        id: "2.1",
        name: "Lentes Prime",
        description: "Lentes de distância focal fixa",
        order: 1,
        showInEcommerce: true,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      },
      {
        id: "2.2",
        name: "Lentes Zoom",
        description: "Lentes com distância focal variável",
        order: 2,
        showInEcommerce: true,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      },
      {
        id: "2.3",
        name: "Adaptador",
        description: "Adaptadores para diferentes montagens",
        order: 3,
        showInEcommerce: true,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      },
    ],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "3",
    name: "Monitores",
    description: "Monitores e displays para produção",
    order: 3,
    showInEcommerce: true,
    subcategories: [
      {
        id: "3.1",
        name: "Atomos",
        description: "Monitores e gravadores Atomos",
        order: 1,
        showInEcommerce: true,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      },
      {
        id: "3.2",
        name: "SmallHD",
        description: "Monitores SmallHD",
        order: 2,
        showInEcommerce: true,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      },
    ],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "4",
    name: "Áudio",
    description: "Equipamentos de captação e reprodução de áudio",
    order: 4,
    showInEcommerce: true,
    subcategories: [],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "5",
    name: "Eletrônicos",
    description: "Equipamentos eletrônicos diversos",
    order: 5,
    showInEcommerce: true,
    subcategories: [
      {
        id: "5.1",
        name: "Baterias",
        description: "Baterias e fontes de energia",
        order: 1,
        showInEcommerce: true,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      },
      {
        id: "5.2",
        name: "Estabilizador",
        description: "Estabilizadores e gimbals",
        order: 2,
        showInEcommerce: true,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      },
    ],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "6",
    name: "Acessórios",
    description: "Acessórios diversos para produção",
    order: 6,
    showInEcommerce: true,
    subcategories: [
      {
        id: "6.1",
        name: "Suporte",
        description: "Suportes e tripés",
        order: 1,
        showInEcommerce: true,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      },
      {
        id: "6.2",
        name: "Filtros",
        description: "Filtros para lentes",
        order: 2,
        showInEcommerce: true,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      },
    ],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
];

const STORAGE_KEY = "rental_categories";

export const CategoryProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  // Save to localStorage whenever categories change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    } catch (error) {
      console.error("Error saving categories to localStorage:", error);
    }
  }, [categories]);

  const addCategory = (
    categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">,
  ) => {
    const newCategory: Category = {
      ...categoryData,
      id: `cat_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCategories((prev) => [...prev, newCategory]);
  };

  const updateCategory = (id: string, categoryData: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id
          ? { ...cat, ...categoryData, updatedAt: new Date().toISOString() }
          : cat,
      ),
    );
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  const addSubcategory = (
    categoryId: string,
    subcategoryData: Omit<Subcategory, "id" | "createdAt" | "updatedAt">,
  ) => {
    const newSubcategory: Subcategory = {
      ...subcategoryData,
      id: `sub_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              subcategories: [...cat.subcategories, newSubcategory],
              updatedAt: new Date().toISOString(),
            }
          : cat,
      ),
    );
  };

  const updateSubcategory = (
    categoryId: string,
    subcategoryId: string,
    subcategoryData: Partial<Subcategory>,
  ) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              subcategories: cat.subcategories.map((sub) =>
                sub.id === subcategoryId
                  ? {
                      ...sub,
                      ...subcategoryData,
                      updatedAt: new Date().toISOString(),
                    }
                  : sub,
              ),
              updatedAt: new Date().toISOString(),
            }
          : cat,
      ),
    );
  };

  const deleteSubcategory = (categoryId: string, subcategoryId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              subcategories: cat.subcategories.filter(
                (sub) => sub.id !== subcategoryId,
              ),
              updatedAt: new Date().toISOString(),
            }
          : cat,
      ),
    );
  };

  const reorderCategories = (categoryId: string, direction: "up" | "down") => {
    setCategories((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex((cat) => cat.id === categoryId);

      if (direction === "up" && index > 0) {
        const temp = sorted[index].order;
        sorted[index].order = sorted[index - 1].order;
        sorted[index - 1].order = temp;
      } else if (direction === "down" && index < sorted.length - 1) {
        const temp = sorted[index].order;
        sorted[index].order = sorted[index + 1].order;
        sorted[index + 1].order = temp;
      }

      return sorted;
    });
  };

  const reorderSubcategories = (
    categoryId: string,
    subcategoryId: string,
    direction: "up" | "down",
  ) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === categoryId) {
          const sortedSubcategories = [...cat.subcategories].sort(
            (a, b) => a.order - b.order,
          );
          const index = sortedSubcategories.findIndex(
            (sub) => sub.id === subcategoryId,
          );

          if (direction === "up" && index > 0) {
            const temp = sortedSubcategories[index].order;
            sortedSubcategories[index].order =
              sortedSubcategories[index - 1].order;
            sortedSubcategories[index - 1].order = temp;
          } else if (
            direction === "down" &&
            index < sortedSubcategories.length - 1
          ) {
            const temp = sortedSubcategories[index].order;
            sortedSubcategories[index].order =
              sortedSubcategories[index + 1].order;
            sortedSubcategories[index + 1].order = temp;
          }

          return {
            ...cat,
            subcategories: sortedSubcategories,
            updatedAt: new Date().toISOString(),
          };
        }
        return cat;
      }),
    );
  };

  const getActiveCategories = () => {
    return categories
      .filter((cat) => cat.showInEcommerce)
      .sort((a, b) => a.order - b.order);
  };

  const getActiveSubcategories = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category
      ? category.subcategories
          .filter((sub) => sub.showInEcommerce)
          .sort((a, b) => a.order - b.order)
      : [];
  };

  const value: CategoryContextType = {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
    reorderCategories,
    reorderSubcategories,
    getActiveCategories,
    getActiveSubcategories,
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = (): CategoryContextType => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error("useCategories must be used within a CategoryProvider");
  }
  return context;
};
