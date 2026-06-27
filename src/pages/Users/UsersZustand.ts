import { create } from "zustand";
import { axiosRequest } from "../../utils/axios";

export interface Role {
  id: string;
  name: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  image?: string;
  dob?: string;
  roles?: string[] | Role[]; // We'll handle both cases depending on how API returns it
}

interface UsersState {
  users: UserProfile[];
  roles: Role[];
  loading: boolean;
  error: string | null;
  totalRecords: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  searchQuery: string;

  setPage: (page: number) => void;
  setSearchQuery: (query: string) => void;
  fetchUsers: () => Promise<void>;
  fetchRoles: () => Promise<void>;
  addRoleToUser: (userId: string, roleId: string) => Promise<boolean>;
  removeRoleFromUser: (userId: string, roleId: string) => Promise<boolean>;
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  roles: [],
  loading: false,
  error: null,
  totalRecords: 0,
  totalPages: 1,
  pageNumber: 1,
  pageSize: 10,
  searchQuery: "",

  setPage: (page) => {
    set({ pageNumber: page });
    get().fetchUsers();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query, pageNumber: 1 });
    get().fetchUsers();
  },

  fetchUsers: async () => {
    set({ loading: true, error: null });
    const { pageNumber, pageSize, searchQuery } = get();
    try {
      let url = `/UserProfile/get-user-profiles?PageNumber=${pageNumber}&PageSize=${pageSize}`;
      if (searchQuery) url += `&UserName=${encodeURIComponent(searchQuery)}`;

      const response = await axiosRequest.get(url);
      const responseData = response.data;
      
      const usersData = Array.isArray(responseData) 
        ? responseData 
        : (responseData?.data || responseData?.userProfiles || []);
        
      const total = responseData?.totalRecord || usersData.length;

      set({ 
        users: usersData, 
        totalRecords: total,
        totalPages: responseData?.totalPage || Math.ceil(total / pageSize) || 1,
        loading: false 
      });
    } catch (error: any) {
      console.error("Fetch users error:", error);
      set({ users: [], error: error.message || "Failed to fetch users", loading: false });
    }
  },

  fetchRoles: async () => {
    try {
      const response = await axiosRequest.get('/UserProfile/get-user-roles');
      const rolesData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      
      // If roles are strings, convert them to objects so it matches the Role interface
      const formattedRoles = rolesData.map((role: any, index: number) => {
        if (typeof role === 'string') {
          return { id: role, name: role };
        }
        return {
          id: role.id?.toString() || role.name || `role-${index}`,
          name: role.name || role.roleName || JSON.stringify(role)
        };
      });
      
      set({ roles: formattedRoles });
    } catch (error) {
      console.error("Fetch roles error:", error);
    }
  },

  addRoleToUser: async (userId, roleId) => {
    set({ loading: true, error: null });
    try {
      await axiosRequest.post(`/UserProfile/addrole-from-user?UserId=${userId}&RoleId=${roleId}`);
      await get().fetchUsers();
      return true;
    } catch (error: any) {
      console.error("Add role error:", error);
      set({ error: error.message || "Failed to add role", loading: false });
      return false;
    }
  },

  removeRoleFromUser: async (userId, roleId) => {
    set({ loading: true, error: null });
    try {
      await axiosRequest.delete(`/UserProfile/remove-role-from-user?UserId=${userId}&RoleId=${roleId}`);
      await get().fetchUsers();
      return true;
    } catch (error: any) {
      console.error("Remove role error:", error);
      set({ error: error.message || "Failed to remove role", loading: false });
      return false;
    }
  }
}));
