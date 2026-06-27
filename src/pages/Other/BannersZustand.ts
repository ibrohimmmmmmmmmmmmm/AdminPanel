import { create } from "zustand";
import { axiosRequest } from "../../utils/axios";

export interface SubCategory {
  id: number;
  subCategoryName: string;
  categoryId: number;
}

interface BannersState {
  subCategories: SubCategory[];
  loading: boolean;
  error: string | null;
  getSubCategories: () => Promise<void>;
  addSubCategory: (categoryId: number, subCategoryName: string) => Promise<void>;
  updateSubCategory: (id: number, categoryId: number, subCategoryName: string) => Promise<void>;
  deleteSubCategory: (id: number) => Promise<void>;
}

export const useBannersStore = create<BannersState>((set, get) => ({
  subCategories: [],
  loading: false,
  error: null,

  getSubCategories: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosRequest.get("/SubCategory/get-sub-category");
      const data = response.data?.data || response.data;
      set({ subCategories: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addSubCategory: async (categoryId: number, subCategoryName: string) => {
    try {
      await axiosRequest.post(`/SubCategory/add-sub-category?CategoryId=${categoryId}&SubCategoryName=${encodeURIComponent(subCategoryName)}`);
      get().getSubCategories();
    } catch (error: any) {
      throw error;
    }
  },

  updateSubCategory: async (id: number, categoryId: number, subCategoryName: string) => {
    try {
      await axiosRequest.put(`/SubCategory/update-sub-category?Id=${id}&CategoryId=${categoryId}&SubCategoryName=${encodeURIComponent(subCategoryName)}`);
      get().getSubCategories();
    } catch (error: any) {
      throw error;
    }
  },

  deleteSubCategory: async (id: number) => {
    try {
      await axiosRequest.delete(`/SubCategory/delete-sub-category?id=${id}`);
      get().getSubCategories();
    } catch (error: any) {
      throw error;
    }
  },
}));
