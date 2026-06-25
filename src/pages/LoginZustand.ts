import { create } from "zustand";
import { axiosRequest } from "../utils/axios";

export const useLoginStore = create((set) => ({
  loginData: null,

  postLogin: async (account: any) => {
    try {
      const response = await axiosRequest.post("/Account/login", account);
      const token = response.data.data; 
      set({loginData: token });
      return token;
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      return null;
    }
  },
}));