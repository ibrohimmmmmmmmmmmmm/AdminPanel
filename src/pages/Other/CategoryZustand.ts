import { create } from "zustand";
import { axiosRequest } from "../../utils/axios";

export interface Category {
  id: number;
  categoryName: string;
  categoryImage: string;
}

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  getCategories: () => Promise<void>;
  addCategory: (formData: FormData) => Promise<void>;
  updateCategory: (formData: FormData) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  getCategories: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosRequest.get("/Category/get-categories");
      // Assuming response.data contains the array or response.data.data
      const data = response.data?.data || response.data;
      set({ categories: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addCategory: async (formData: FormData) => {
    try {
      await axiosRequest.post("/Category/add-category", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      get().getCategories();
    } catch (error: any) {
      throw error;
    }
  },

  updateCategory: async (formData: FormData) => {
    try {
      await axiosRequest.put("/Category/update-category", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      get().getCategories();
    } catch (error: any) {
      throw error;
    }
  },

  deleteCategory: async (id: number) => {
    try {
      await axiosRequest.delete(`/Category/delete-category?id=${id}`);
      get().getCategories();
    } catch (error: any) {
      throw error;
    }
  },
}));
