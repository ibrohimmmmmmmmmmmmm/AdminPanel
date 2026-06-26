import React, { useEffect, useState } from "react";
import { create } from "zustand";
import { axiosRequest } from "../../utils/axios";
import { Search, Plus, Trash2, Edit, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useForm } from "react-hook-form";

// --- ZUSTAND STORE ---
export interface Product {
  id: number;
  productName: string;
  description: string;
  price: number;
  quantity: number;
  categoryName: string;
  subCategoryName: string;
  brandName: string;
  colorName: string;
  imagePaths: string[];
  code: string;
  hasDiscount: boolean;
  discountPrice: number;
  categoryId: number;
  subCategoryId: number;
  brandId: number;
  colorId: number;
}

export interface Color { id: number; colorName: string; }
export interface Brand { id: number; brandName: string; }
export interface Category { id: number; categoryName: string; }
export interface SubCategory { id: number; subCategoryName: string; categoryId: number; }

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  totalRecords: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  searchQuery: string;
  categoryId: number | null;
  selectedProductIds: number[];

  colors: Color[];
  brands: Brand[];
  categories: Category[];
  subCategories: SubCategory[];

  setPage: (page: number) => void;
  setSearchQuery: (query: string) => void;
  setCategoryId: (id: number | null) => void;
  toggleProductSelection: (id: number) => void;
  toggleAllSelection: (ids: number[]) => void;
  clearSelection: () => void;

  fetchProducts: () => Promise<void>;
  fetchMetadata: () => Promise<void>;
  addProduct: (formData: FormData) => Promise<boolean>;
  updateProduct: (id: number, data: any) => Promise<boolean>;
  deleteProduct: (id: number) => Promise<boolean>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loading: false,
  error: null,
  totalRecords: 0,
  totalPages: 1,
  pageNumber: 1,
  pageSize: 10,
  searchQuery: "",
  categoryId: null,
  selectedProductIds: [],
  
  colors: [],
  brands: [],
  categories: [],
  subCategories: [],

  setPage: (page) => {
    set({ pageNumber: page });
    get().fetchProducts();
  },
  
  setSearchQuery: (query) => {
    set({ searchQuery: query, pageNumber: 1 });
    get().fetchProducts();
  },

  setCategoryId: (id) => {
    set({ categoryId: id, pageNumber: 1 });
    get().fetchProducts();
  },

  toggleProductSelection: (id) => {
    set((state) => ({
      selectedProductIds: state.selectedProductIds.includes(id)
        ? state.selectedProductIds.filter((pId) => pId !== id)
        : [...state.selectedProductIds, id],
    }));
  },

  toggleAllSelection: (ids) => {
    set((state) => {
      const allSelected = ids.every((id) => state.selectedProductIds.includes(id));
      return {
        selectedProductIds: allSelected
          ? state.selectedProductIds.filter((id) => !ids.includes(id)) 
          : Array.from(new Set([...state.selectedProductIds, ...ids])),
      };
    });
  },

  clearSelection: () => set({ selectedProductIds: [] }),

  fetchProducts: async () => {
    set({ loading: true, error: null });
    const { pageNumber, pageSize, searchQuery, categoryId } = get();
    try {
      let url = `/Product/get-products?PageNumber=${pageNumber}&PageSize=${pageSize}`;
      if (searchQuery) url += `&ProductName=${encodeURIComponent(searchQuery)}`;
      if (categoryId) url += `&CategoryId=${categoryId}`;
      
      const response = await axiosRequest.get(url);
      const responseData = response.data;
      const data = responseData?.data?.products || [];
      const total = responseData?.totalRecord || data.length;
      
      set({ 
        products: data, 
        totalRecords: total,
        totalPages: responseData?.totalPage || Math.ceil(total / pageSize) || 1,
        loading: false 
      });
    } catch (error: any) {
      console.error("Fetch products error:", error);
      set({ products: [], error: error.message || "Failed to fetch products", loading: false });
    }
  },

  fetchMetadata: async () => {
    try {
      const [colorsRes, brandsRes, categoriesRes, subCatRes] = await Promise.all([
        axiosRequest.get('/Color/get-colors?PageNumber=1&PageSize=100'),
        axiosRequest.get('/Brand/get-brands?PageNumber=1&PageSize=100'),
        axiosRequest.get('/Category/get-categories'),
        axiosRequest.get('/SubCategory/get-sub-category')
      ]);
      set({
        colors: Array.isArray(colorsRes.data) ? colorsRes.data : (colorsRes.data?.data || []),
        brands: Array.isArray(brandsRes.data) ? brandsRes.data : (brandsRes.data?.data || []),
        categories: Array.isArray(categoriesRes.data) ? categoriesRes.data : (categoriesRes.data?.data || []),
        subCategories: Array.isArray(subCatRes.data) ? subCatRes.data : (subCatRes.data?.data || [])
      });
    } catch (error) {
      console.error("Fetch metadata error:", error);
    }
  },

  addProduct: async (formData) => {
    set({ loading: true, error: null });
    try {
      await axiosRequest.post("/Product/add-product", formData);
      await get().fetchProducts();
      return true;
    } catch (error: any) {
      console.error("Add product error:", error);
      set({ error: error.message || "Failed to add product", loading: false });
      return false;
    }
  },

  updateProduct: async (id, data) => {
    set({ loading: true, error: null });
    try {
      let url = `/Product/update-product?Id=${id}`;
      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined && value !== null) {
          url += `&${key}=${encodeURIComponent(String(value))}`;
        }
      }
      
      await axiosRequest.put(url);
      await get().fetchProducts();
      return true;
    } catch (error: any) {
      console.error("Update product error:", error);
      set({ error: error.message || "Failed to update product", loading: false });
      return false;
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      await axiosRequest.delete(`/Product/delete-product?id=${id}`);
      set((state) => ({
        selectedProductIds: state.selectedProductIds.filter(selId => selId !== id)
      }));
      await get().fetchProducts();
      return true;
    } catch (error: any) {
      console.error("Delete product error:", error);
      set({ error: error.message || "Failed to delete product", loading: false });
      return false;
    }
  }
}));

// --- MODALS ---

const AddProductModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { addProduct, brands, colors, subCategories } = useProductStore();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  if (!isOpen) return null;

  const onSubmit = async (data: any) => {
    const formData = new FormData();
    formData.append("BrandId", data.BrandId || 0);
    formData.append("Code", data.Code || "");
    formData.append("ColorId", data.ColorId || 0);
    formData.append("Description", data.Description || "");
    formData.append("HasDiscount", data.HasDiscount ? "true" : "false");
    formData.append("Price", data.Price || 0);
    formData.append("ProductName", data.ProductName || "");
    formData.append("Quantity", data.Quantity || 0);
    formData.append("SubCategoryId", data.SubCategoryId || 0);
    formData.append("Weight", "0");
    formData.append("Size", "0");
    formData.append("DiscountPrice", "0");
    
    if (data.Images && data.Images.length > 0) {
      for (let i = 0; i < data.Images.length; i++) {
        formData.append("Images", data.Images[i]);
      }
    }

    const success = await addProduct(formData);
    if (success) {
      reset();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Product</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input
                {...register("ProductName", { required: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter product name"
              />
              {errors.ProductName && <span className="text-red-500 text-xs mt-1">This field is required</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input type="number" step="0.01" {...register("Price", { required: true })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input type="number" {...register("Quantity", { required: true })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
              <input {...register("Code")} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Product Code" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand ID</label>
              <select {...register("BrandId", { required: true })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Select Brand</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.brandName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color ID</label>
              <select {...register("ColorId", { required: true })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Select Color</option>
                {colors.map(c => <option key={c.id} value={c.id}>{c.colorName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SubCategory ID</label>
              <select {...register("SubCategoryId", { required: true })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Select SubCategory</option>
                {subCategories.map(sc => <option key={sc.id} value={sc.id}>{sc.subCategoryName}</option>)}
              </select>
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" id="HasDiscount" {...register("HasDiscount")} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <label htmlFor="HasDiscount" className="text-sm font-medium text-gray-700">Has Discount?</label>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea {...register("Description")} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter product description"></textarea>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
              <input type="file" multiple {...register("Images")} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 font-medium transition-colors">Save Product</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditProductModal = ({ isOpen, onClose, product }: { isOpen: boolean; onClose: () => void; product: Product | null }) => {
  const { updateProduct, brands, colors, subCategories } = useProductStore();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    if (product && isOpen) {
      reset({
        ProductName: product.productName,
        Price: product.price,
        Quantity: product.quantity,
        Code: product.code,
        BrandId: product.brandId,
        ColorId: product.colorId,
        SubCategoryId: product.subCategoryId,
        HasDiscount: product.hasDiscount,
        Description: product.description,
      });
    }
  }, [product, isOpen, reset]);

  if (!isOpen || !product) return null;

  const onSubmit = async (data: any) => {
    const payload = {
      BrandId: data.BrandId || 0,
      Code: data.Code || "",
      ColorId: data.ColorId || 0,
      Description: data.Description || "",
      HasDiscount: data.HasDiscount ? true : false,
      Price: data.Price || 0,
      ProductName: data.ProductName || "",
      Quantity: data.Quantity || 0,
      SubCategoryId: data.SubCategoryId || 0,
      Weight: "0",
      Size: "0",
      DiscountPrice: 0
    };

    const success = await updateProduct(product.id, payload);
    if (success) {
      reset();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Product</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input
                {...register("ProductName", { required: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter product name"
              />
              {errors.ProductName && <span className="text-red-500 text-xs mt-1">This field is required</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input type="number" step="0.01" {...register("Price", { required: true })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input type="number" {...register("Quantity", { required: true })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
              <input {...register("Code")} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Product Code" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand ID</label>
              <select {...register("BrandId", { required: true })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Select Brand</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.brandName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color ID</label>
              <select {...register("ColorId", { required: true })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Select Color</option>
                {colors.map(c => <option key={c.id} value={c.id}>{c.colorName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SubCategory ID</label>
              <select {...register("SubCategoryId", { required: true })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Select SubCategory</option>
                {subCategories.map(sc => <option key={sc.id} value={sc.id}>{sc.subCategoryName}</option>)}
              </select>
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" id="EditHasDiscount" {...register("HasDiscount")} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <label htmlFor="EditHasDiscount" className="text-sm font-medium text-gray-700">Has Discount?</label>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea {...register("Description")} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter product description"></textarea>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 font-medium transition-colors">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteProductModal = ({ isOpen, onClose, product }: { isOpen: boolean; onClose: () => void; product: Product | null }) => {
  const { deleteProduct } = useProductStore();

  if (!isOpen || !product) return null;

  const handleDelete = async () => {
    const success = await deleteProduct(product.id);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Delete Product</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <span className="font-semibold text-gray-900">{product.productName}</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 bg-red-600 rounded-md text-white hover:bg-red-700 font-medium transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---

export default function ProductPage() {
  const {
    products,
    loading,
    totalRecords,
    totalPages,
    pageNumber,
    pageSize,
    searchQuery,
    selectedProductIds,
    setPage,
    setSearchQuery,
    toggleProductSelection,
    toggleAllSelection,
    clearSelection,
    fetchProducts,
    fetchMetadata,
    deleteProduct,
  } = useProductStore();

  const [searchInput, setSearchInput] = useState(searchQuery);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProductItem, setDeleteProductItem] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchMetadata();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      toggleAllSelection(products.map(p => p.id));
    } else {
      toggleAllSelection(products.map(p => p.id));
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedProductIds.length} products?`)) {
      for (const id of selectedProductIds) {
        await deleteProduct(id);
      }
      clearSelection();
    }
  };

  const allSelected = products.length > 0 && products.every(p => selectedProductIds.includes(p.id));

  return (
    <div className="p-6 bg-white w-full min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-[32px] font-bold text-gray-900">Products</h1>
        <button 
          className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white px-5 py-2.5 rounded-md font-medium transition-colors"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus size={20} />
          Add order
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative w-[320px]">
            <input
              type="text"
              placeholder="Search..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 text-gray-600 placeholder-gray-400"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={20} />
            </button>
          </form>

          <div className="relative">
            <span className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-gray-500">Filter</span>
            <button className="flex items-center justify-between border border-gray-200 rounded-md px-4 py-2.5 bg-white text-gray-700 min-w-[140px]">
              Newest
              <ChevronDown size={18} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button 
            className="p-2.5 border border-gray-200 text-[#2563EB] hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
            disabled={selectedProductIds.length !== 1}
            onClick={() => {
              const prod = products.find(p => p.id === selectedProductIds[0]);
              if (prod) setEditProduct(prod);
            }}
          >
            <Edit size={20} />
          </button>
          <button 
            className="p-2.5 border border-gray-200 text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
            disabled={selectedProductIds.length === 0}
            onClick={handleBulkDelete}
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto border-t border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[#6B7280] text-sm">
              <th className="py-4 px-4 w-[50px]">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
              </th>
              <th className="py-4 px-4 font-normal">Product</th>
              <th className="py-4 px-4 font-normal">Inventory</th>
              <th className="py-4 px-4 font-normal">Category</th>
              <th className="py-4 px-4 font-normal">Price</th>
              <th className="py-4 px-4 font-normal">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center p-8 text-gray-500">Loading products...</td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-8 text-gray-500">No products found.</td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <input
                      type="checkbox"
                      checked={selectedProductIds.includes(product.id)}
                      onChange={() => toggleProductSelection(product.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                        {product.image ? (
                          <img
                            src={product.image.startsWith('http') ? product.image : `${import.meta.env.VITE_BASE_URL}/images/${product.image}`}
                            alt={product.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200"></div>
                        )}
                      </div>
                      <span className="font-medium text-gray-900">{product.productName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {product.quantity > 0 ? (
                      <span className="text-gray-600">{product.quantity} in stock</span>
                    ) : (
                      <span className="inline-flex px-3 py-1 bg-[#EEF2FF] text-[#6366F1] text-sm font-medium rounded-md">
                        Out of Stock
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-gray-600">{product.categoryName || "Uncategorized"}</td>
                  <td className="py-4 px-4 text-gray-600">${product.price?.toFixed(2)}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-4">
                      <button 
                        className="text-[#2563EB] hover:text-blue-800 transition-colors"
                        onClick={() => setEditProduct(product)}
                      >
                        <Edit size={20} />
                      </button>
                      <button 
                        className="text-red-500 hover:text-red-700 transition-colors"
                        onClick={() => setDeleteProductItem(product)}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-8 px-4">
        <div className="flex items-center gap-1">
          <button 
            className="p-2 text-[#6B7280] hover:text-gray-900 disabled:opacity-50"
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

            return pages.map((page, index) => {
              if (page === '...') {
                return <span key={`dots-${index}`} className="px-2 text-[#6B7280]">...</span>;
              }
              return (
                <button
                  key={page}
                  className={`min-w-[32px] h-8 px-2 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                    pageNumber === page
                      ? "bg-[#EEF2FF] text-[#4F46E5]"
                      : "text-[#6B7280] hover:bg-gray-100"
                  }`}
                  onClick={() => setPage(page as number)}
                >
                  {page}
                </button>
              );
            });
          })()}

          <button 
            className="p-2 text-[#6B7280] hover:text-gray-900 disabled:opacity-50"
            disabled={pageNumber === totalPages}
            onClick={() => setPage(pageNumber + 1)}
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="text-sm text-[#6B7280]">
          {totalRecords} Results
        </div>
      </div>

      {/* Modals */}
      <AddProductModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <EditProductModal isOpen={!!editProduct} onClose={() => setEditProduct(null)} product={editProduct} />
      <DeleteProductModal isOpen={!!deleteProductItem} onClose={() => setDeleteProductItem(null)} product={deleteProductItem} />
    </div>
  );
}
