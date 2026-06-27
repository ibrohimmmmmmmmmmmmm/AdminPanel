import { create } from "zustand";
import { axiosRequest } from "../../utils/axios";

export interface Brand {
  id: number;
  brandName: string;
}

interface BrandState {
  brands: Brand[];
  loading: boolean;
  error: string | null;
  getBrands: () => Promise<void>;
  addBrand: (brandName: string) => Promise<void>;
  updateBrand: (id: number, brandName: string) => Promise<void>;
  deleteBrand: (id: number) => Promise<void>;
}

export const useBrandStore = create<BrandState>((set, get) => ({
  brands: [],
  loading: false,
  error: null,

  getBrands: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosRequest.get("/Brand/get-brands");
      const data = response.data?.data || response.data;
      set({ brands: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addBrand: async (brandName: string) => {
    try {
      await axiosRequest.post(`/Brand/add-brand?BrandName=${encodeURIComponent(brandName)}`);
      get().getBrands();
    } catch (error: any) {
      throw error;
    }
  },

  updateBrand: async (id: number, brandName: string) => {
    try {
      await axiosRequest.put(`/Brand/update-brand?Id=${id}&BrandName=${encodeURIComponent(brandName)}`);
      get().getBrands();
    } catch (error: any) {
      throw error;
    }
  },

  deleteBrand: async (id: number) => {
    try {
      await axiosRequest.delete(`/Brand/delete-brand?id=${id}`);
      get().getBrands();
    } catch (error: any) {
      throw error;
    }
  },
}));
