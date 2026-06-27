import React, { useEffect, useState } from "react";
import { create } from "zustand";
import { axiosRequest } from "../../utils/axios";
import { Search, Plus, Trash2, Edit, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

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

// Add and Edit Modals were moved to separate pages

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

const BulkDeleteModal = ({ isOpen, onClose, count, onConfirm }: { isOpen: boolean; onClose: () => void; count: number; onConfirm: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Bulk Delete Products</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <span className="font-semibold text-gray-900">{count}</span> products? This action cannot be undone.
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

  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState(searchQuery);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [sortFilter, setSortFilter] = useState("Newest");
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
      clearSelection();
    }
  };

  const confirmBulkDelete = async () => {
    setIsBulkDeleteModalOpen(false);
    for (const id of selectedProductIds) {
      await deleteProduct(id);
    }
    clearSelection();
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (sortFilter === "Oldest") return a.id - b.id;
    return b.id - a.id;
  });

  const allSelected = products.length > 0 && products.every(p => selectedProductIds.includes(p.id));

  return (
    <div className="p-6 bg-white w-full min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-[32px] font-bold text-gray-900">Products</h1>
        <button 
          className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white px-5 py-2.5 rounded-md font-medium transition-colors"
          onClick={() => navigate("/admin/products/add")}
        >
          <Plus size={20} />
          Add order
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search Product Name + Enter" 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 text-sm"
            />
          </form>
          <select 
            value={sortFilter}
            onChange={(e) => setSortFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm text-gray-700"
          >
            <option value="Newest">Filter: Newest</option>
            <option value="Oldest">Filter: Oldest</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button 
            className="p-2.5 border border-gray-200 text-[#2563EB] hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
            disabled={selectedProductIds.length !== 1}
            onClick={() => {
              const prod = products.find(p => p.id === selectedProductIds[0]);
              if (prod) navigate("/admin/products/edit/" + prod.id, { state: { product: prod } });
            }}
          >
            <Edit size={20} />
          </button>
          <button 
            className="p-2.5 border border-gray-200 text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
            disabled={selectedProductIds.length === 0}
            onClick={() => setIsBulkDeleteModalOpen(true)}
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
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center p-8 text-gray-500">Loading products...</td>
              </tr>
            ) : sortedProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-8 text-gray-500">No products found.</td>
              </tr>
            ) : (
              sortedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4 w-12">
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
                        onClick={() => navigate("/admin/products/edit/" + product.id, { state: { product } })}
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
      <DeleteProductModal isOpen={!!deleteProductItem} onClose={() => setDeleteProductItem(null)} product={deleteProductItem} />
      <BulkDeleteModal 
        isOpen={isBulkDeleteModalOpen} 
        onClose={() => setIsBulkDeleteModalOpen(false)} 
        count={selectedProductIds.length} 
        onConfirm={confirmBulkDelete} 
      />
    </div>
  );
}
