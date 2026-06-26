import React, { useEffect, useState } from "react";
import { create } from "zustand";
import { useForm } from "react-hook-form";
import { axiosRequest } from "../../utils/axios";
import { Search, Plus, Trash2, Edit, ChevronLeft, ChevronRight, X, ChevronDown } from "lucide-react";

// --- TYPES ---

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dob: string;
  image: string | null;
}

interface OrderState {
  orders: UserProfile[];
  loading: boolean;
  error: string | null;
  totalRecords: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  searchQuery: string;
  selectedOrderIds: string[];

  setPage: (page: number) => void;
  setSearchQuery: (query: string) => void;
  toggleOrderSelection: (id: string) => void;
  toggleAllSelection: (ids: string[]) => void;
  clearSelection: () => void;

  fetchOrders: () => Promise<void>;
  addOrder: (data: any) => Promise<boolean>;
  updateOrder: (id: string, data: any) => Promise<boolean>;
  deleteOrder: (id: string) => Promise<boolean>;
}

// --- STORE ---

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  loading: false,
  error: null,
  totalRecords: 0,
  totalPages: 1,
  pageNumber: 1,
  pageSize: 10,
  searchQuery: "",
  selectedOrderIds: [],

  setPage: (page) => {
    set({ pageNumber: page });
    get().fetchOrders();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query, pageNumber: 1 });
    get().fetchOrders();
  },

  toggleOrderSelection: (id) => set((state) => {
    const isSelected = state.selectedOrderIds.includes(id);
    return {
      selectedOrderIds: isSelected 
        ? state.selectedOrderIds.filter((orderId) => orderId !== id)
        : [...state.selectedOrderIds, id]
    };
  }),

  toggleAllSelection: (ids) => set({ selectedOrderIds: ids }),
  clearSelection: () => set({ selectedOrderIds: [] }),

  fetchOrders: async () => {
    set({ loading: true, error: null });
    const { pageNumber, pageSize, searchQuery } = get();
    try {
      let url = `/UserProfile/get-user-profiles?PageNumber=${pageNumber}&PageSize=${pageSize}`;
      if (searchQuery) url += `&UserName=${encodeURIComponent(searchQuery)}`;
      
      const response = await axiosRequest.get(url);
      const responseData = response.data;
      const data = Array.isArray(responseData) ? responseData : (responseData?.data || []);
      const total = responseData?.totalRecord || data.length;
      
      set({ 
        orders: data, 
        totalRecords: total,
        totalPages: responseData?.totalPage || Math.ceil(total / pageSize) || 1,
        loading: false 
      });
    } catch (error: any) {
      console.error("Fetch orders error:", error);
      set({ orders: [], error: error.message || "Failed to fetch orders", loading: false });
    }
  },

  addOrder: async (data) => {
    set({ loading: true, error: null });
    try {
      await axiosRequest.post("/Account/register", data);
      await get().fetchOrders();
      return true;
    } catch (error: any) {
      console.error("Add order error:", error);
      set({ error: error.message || "Failed to add order", loading: false });
      return false;
    }
  },

  updateOrder: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await axiosRequest.put(`/UserProfile/update-user-profile?id=${id}`, data);
      await get().fetchOrders();
      return true;
    } catch (error: any) {
      console.error("Update order error:", error);
      set({ error: error.message || "Failed to update order", loading: false });
      return false;
    }
  },

  deleteOrder: async (id) => {
    set({ loading: true, error: null });
    try {
      await axiosRequest.delete(`/UserProfile/delete-user?id=${id}`);
      await get().fetchOrders();
      return true;
    } catch (error: any) {
      console.error("Delete order error:", error);
      set({ error: error.message || "Failed to delete order", loading: false });
      return false;
    }
  }
}));

// --- MODALS ---

const AddOrderModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { addOrder } = useOrderStore();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  if (!isOpen) return null;

  const onSubmit = async (data: any) => {
    const payload = {
      userName: data.userName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      password: data.password,
      confirmPassword: data.confirmPassword
    };

    const success = await addOrder(payload);
    if (success) {
      reset();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Add Order (Register User)</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User Name</label>
            <input {...register("userName", { required: true })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.userName && <span className="text-red-500 text-xs">Required</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" {...register("email", { required: true })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.email && <span className="text-red-500 text-xs">Required</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input type="tel" {...register("phoneNumber", { required: true })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.phoneNumber && <span className="text-red-500 text-xs">Required</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" {...register("password", { required: true })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.password && <span className="text-red-500 text-xs">Required</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input type="password" {...register("confirmPassword", { required: true })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.confirmPassword && <span className="text-red-500 text-xs">Required</span>}
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 font-medium">Add Order</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditOrderModal = ({ isOpen, onClose, order }: { isOpen: boolean; onClose: () => void; order: UserProfile | null }) => {
  const { updateOrder } = useOrderStore();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    if (order && isOpen) {
      reset({
        FirstName: order.firstName || "",
        LastName: order.lastName || "",
        Email: order.email || "",
        PhoneNumber: order.phoneNumber || "",
        Dob: order.dob ? new Date(order.dob).toISOString().split('T')[0] : ""
      });
    }
  }, [order, isOpen, reset]);

  if (!isOpen || !order) return null;

  const onSubmit = async (data: any) => {
    const formData = new FormData();
    formData.append("FirstName", data.FirstName);
    formData.append("LastName", data.LastName);
    formData.append("Email", data.Email);
    formData.append("PhoneNumber", data.PhoneNumber);
    formData.append("Dob", data.Dob || new Date().toISOString());

    if (data.Image && data.Image.length > 0) {
      formData.append("Image", data.Image[0]);
    }

    const success = await updateOrder(order.id, formData);
    if (success) {
      reset();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Edit Order (User Profile)</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input {...register("FirstName", { required: true })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.FirstName && <span className="text-red-500 text-xs">Required</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input {...register("LastName", { required: true })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.LastName && <span className="text-red-500 text-xs">Required</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" {...register("Email", { required: true })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.Email && <span className="text-red-500 text-xs">Required</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input type="tel" {...register("PhoneNumber", { required: true })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.PhoneNumber && <span className="text-red-500 text-xs">Required</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input type="date" {...register("Dob", { required: true })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.Dob && <span className="text-red-500 text-xs">Required</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image (Optional)</label>
            <input type="file" {...register("Image")} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 font-medium">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteOrderModal = ({ isOpen, onClose, order }: { isOpen: boolean; onClose: () => void; order: UserProfile | null }) => {
  const { deleteOrder } = useOrderStore();

  if (!isOpen || !order) return null;

  const handleDelete = async () => {
    const success = await deleteOrder(order.id);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Delete Order</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <span className="font-semibold text-gray-900">{(order.firstName || '') + ' ' + (order.lastName || '')}</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 bg-red-600 rounded-md text-white hover:bg-red-700 font-medium transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
};

const BulkDeleteModal = ({ isOpen, onClose, count, onConfirm }: { isOpen: boolean; onClose: () => void; count: number; onConfirm: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Bulk Delete Orders</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <span className="font-semibold text-gray-900">{count}</span> orders? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 rounded-md text-white hover:bg-red-700 font-medium transition-colors">Delete All</button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---

export default function OrderPage() {
  const {
    orders,
    loading,
    totalRecords,
    totalPages,
    pageNumber,
    searchQuery,
    selectedOrderIds,
    setPage,
    setSearchQuery,
    toggleOrderSelection,
    toggleAllSelection,
    clearSelection,
    fetchOrders,
    deleteOrder,
  } = useOrderStore();

  const [searchInput, setSearchInput] = useState(searchQuery);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [sortFilter, setSortFilter] = useState("Newest");
  const [editOrder, setEditOrder] = useState<UserProfile | null>(null);
  const [deleteOrderItem, setDeleteOrderItem] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      toggleAllSelection(orders.map(o => o.id));
    } else {
      clearSelection();
    }
  };

  const confirmBulkDelete = async () => {
    setIsBulkDeleteModalOpen(false);
    for (const id of selectedOrderIds) {
      await deleteOrder(id);
    }
    clearSelection();
  };

  const getId = (o: any) => String(o.id || o.Id || o.userId || o.UserId || "");

  // Mock Sorting (since no native sort available in UserProfile)
  const sortedOrders = [...orders].sort((a, b) => {
    const idA = getId(a);
    const idB = getId(b);
    if (sortFilter === "Oldest") return idA.localeCompare(idB);
    return idB.localeCompare(idA);
  });

  const allSelected = orders.length > 0 && orders.every(o => getId(o) && selectedOrderIds.includes(getId(o)));

  // Helper to generate a fake price based on ID
  const getFakePrice = (id: string) => {
    const safeId = id ? String(id) : "";
    const num = Array.from(safeId).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (num % 100 + 10.99).toFixed(2);
  };

  return (
    <div className="p-6 bg-white w-full min-h-screen font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[28px] font-bold text-gray-900">Orders</h1>
        <button 
          className="flex items-center gap-2 bg-[#3B82F6] hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors text-sm"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus size={18} />
          Add order
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(e as any); }}
              className="pr-10 pl-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-[240px] text-sm text-gray-700 placeholder-gray-400"
            />
            <button 
              type="button" 
              onClick={handleSearch as any} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Search size={18} />
            </button>
          </div>
          
          <div className="relative">
            <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-gray-400">Filter</label>
            <select 
              value={sortFilter}
              onChange={(e) => setSortFilter(e.target.value)}
              className="px-4 py-2 pr-8 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-sm text-gray-700 appearance-none w-32 cursor-pointer"
            >
              <option value="Newest">Newest</option>
              <option value="Oldest">Oldest</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button 
            className="p-2 border border-gray-200 text-[#3B82F6] hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
            disabled={selectedOrderIds.length !== 1}
            onClick={() => {
              const order = orders.find(o => getId(o) === selectedOrderIds[0]);
              if (order) setEditOrder(order);
            }}
          >
            <Edit size={18} />
          </button>
          <button 
            className="p-2 border border-gray-200 text-[#3B82F6] hover:bg-red-50 hover:text-red-500 hover:border-red-200 rounded-md transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:text-gray-400"
            disabled={selectedOrderIds.length === 0}
            onClick={() => setIsBulkDeleteModalOpen(true)}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-t border-gray-200 text-[#6B7280] text-sm">
              <th className="py-4 px-4 w-12 font-medium">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
              </th>
              <th className="py-4 px-4 font-medium">Order</th>
              <th className="py-4 px-4 font-medium">Date</th>
              <th className="py-4 px-4 font-medium">Customer</th>
              <th className="py-4 px-4 font-medium">Payment status</th>
              <th className="py-4 px-4 font-medium">Order Status</th>
              <th className="py-4 px-4 font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center p-8 text-gray-500">Loading orders...</td>
              </tr>
            ) : sortedOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-8 text-gray-500">No orders found.</td>
              </tr>
            ) : (
              sortedOrders.map((order, index) => {
                const actualId = getId(order);
                const safeId = actualId || `unknown-${index}`;
                const shortId = "#" + safeId.substring(0, 6).toUpperCase();
                
                const dob = (order as any).dob || (order as any).Dob;
                const fakeDate = dob ? new Date(dob).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : "May 5, 4:20 PM";
                
                // Deterministic mock data based on ID string characters
                const charSum = Array.from(safeId).reduce((acc, char) => acc + char.charCodeAt(0), 0);
                const isPending = charSum % 3 === 0;
                
                let statusType = charSum % 4;
                // 0: Ready, 1: Shipped, 2: Received, 3: Ready
                
                return (
                  <tr key={safeId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4 w-12">
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.includes(safeId)}
                        onChange={() => toggleOrderSelection(safeId)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-gray-900">{shortId}</span>
                    </td>
                    <td className="py-4 px-4 text-gray-600 text-sm">{fakeDate}</td>
                    <td className="py-4 px-4 text-gray-700 text-sm">
                      {((order as any).firstName || (order as any).FirstName || (order as any).lastName || (order as any).LastName) 
                        ? `${(order as any).firstName || (order as any).FirstName || ''} ${(order as any).lastName || (order as any).LastName || ''}`.trim() 
                        : (order as any).email || (order as any).Email || (order as any).userName || (order as any).UserName || "Unknown"}
                    </td>
                    <td className="py-4 px-4">
                      {isPending ? (
                        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#E2E8F0] text-[#64748B]">
                          Pending
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#D1FAE5] text-[#10B981]">
                          Paid
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {statusType === 1 ? (
                        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#64748B] text-white">
                          Shipped
                        </span>
                      ) : statusType === 2 ? (
                        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#3B82F6] text-white">
                          Received
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#F59E0B] text-white">
                          Ready
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-gray-700 text-sm">
                      ${getFakePrice(safeId)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6 px-2">
        <div className="flex items-center gap-1">
          <button 
            className="p-1.5 text-gray-500 hover:text-gray-900 disabled:opacity-50"
            disabled={pageNumber === 1}
            onClick={() => setPage(pageNumber - 1)}
          >
            <ChevronLeft size={20} />
          </button>
          
          {(() => {
            const pages = [];
            if (totalPages <= 7) {
              for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else {
              if (pageNumber <= 4) {
                for (let i = 1; i <= 6; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
              } else if (pageNumber >= totalPages - 3) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 5; i <= totalPages; i++) pages.push(i);
              } else {
                pages.push(1);
                pages.push('...');
                for (let i = pageNumber - 2; i <= pageNumber + 2; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
              }
            }

            return pages.map((page, index) => (
              <button
                key={index}
                disabled={page === '...'}
                onClick={() => typeof page === 'number' && setPage(page)}
                className={`min-w-[32px] h-8 flex items-center justify-center rounded-md text-sm transition-colors ${
                  page === pageNumber 
                    ? 'bg-blue-50 text-blue-600 font-medium' 
                    : page === '...' 
                      ? 'text-gray-400 cursor-default'
                      : 'text-gray-600 hover:bg-gray-100 font-medium'
                }`}
              >
                {page}
              </button>
            ));
          })()}
          
          <button 
            className="p-1.5 text-gray-500 hover:text-gray-900 disabled:opacity-50"
            disabled={pageNumber === Math.max(1, totalPages)}
            onClick={() => setPage(pageNumber + 1)}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="text-sm text-gray-500 font-medium">
          {totalRecords} Results
        </div>
      </div>

      {/* Modal Components */}
      <AddOrderModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <EditOrderModal isOpen={!!editOrder} onClose={() => setEditOrder(null)} order={editOrder} />
      <DeleteOrderModal isOpen={!!deleteOrderItem} onClose={() => setDeleteOrderItem(null)} order={deleteOrderItem} />
      <BulkDeleteModal 
        isOpen={isBulkDeleteModalOpen} 
        onClose={() => setIsBulkDeleteModalOpen(false)} 
        count={selectedOrderIds.length} 
        onConfirm={confirmBulkDelete} 
      />
    </div>
  );
}
