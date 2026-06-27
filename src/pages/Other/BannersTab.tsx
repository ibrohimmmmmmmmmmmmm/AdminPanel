import React, { useEffect, useState } from "react";
import { useBannersStore } from "./BannersZustand";
import { useCategoryStore } from "./CategoryZustand";
import { Edit2, Plus, Search, Trash2, X, Tag } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

interface BannerFormData {
  categoryId: number;
  subCategoryName: string;
}

export const BannersTab = () => {
  const { subCategories, getSubCategories, addSubCategory, updateSubCategory, deleteSubCategory, loading } = useBannersStore();
  const { categories, getCategories } = useCategoryStore();
  
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<BannerFormData>();

  useEffect(() => {
    getSubCategories();
    getCategories(); // Need categories for the dropdown
  }, [getSubCategories, getCategories]);

  // Filtering
  const filteredItems = subCategories?.filter(item => 
    item.subCategoryName?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const openModal = (item?: any) => {
    if (item) {
      setEditingSubCategory(item);
      reset({
        categoryId: item.categoryId,
        subCategoryName: item.subCategoryName,
      });
    } else {
      setEditingSubCategory(null);
      reset({ subCategoryName: "", categoryId: categories[0]?.id || "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSubCategory(null);
    reset();
  };

  const onSubmit = async (data: BannerFormData) => {
    try {
      if (editingSubCategory) {
        await updateSubCategory(editingSubCategory.id, data.categoryId, data.subCategoryName);
        toast.success("SubCategory updated successfully");
      } else {
        await addSubCategory(data.categoryId, data.subCategoryName);
        toast.success("SubCategory added successfully");
      }
      closeModal();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const handleDeleteClick = (id: number) => {
    setItemToDelete(id);
  };

  const confirmDelete = async () => {
    if (itemToDelete === null) return;
    try {
      await deleteSubCategory(itemToDelete);
      toast.success("SubCategory deleted");
    } catch (error: any) {
      toast.error("Failed to delete");
    } finally {
      setItemToDelete(null);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Helper to get category name for the cards
  const getCategoryName = (catId: number) => {
    const cat = categories?.find(c => c.id === catId);
    return cat ? cat.categoryName : "Unknown Category";
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Search and Add */}
      <div className="flex items-center justify-between">
        <div className="relative w-80">
          <input
            type="text"
            placeholder="Search subcategories..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-4 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
        </div>
        
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Add new
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center p-10"><span className="text-gray-500">Loading...</span></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentItems.map((item) => (
            <div key={item.id} className="border rounded-xl p-5 flex flex-col relative group hover:shadow-md transition-shadow bg-white">
              <div className="flex justify-between items-start mb-3">
                <div className="bg-blue-50 text-blue-600 p-3 rounded-lg">
                  <Tag size={24} />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => openModal(item)}
                    className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-full transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(item.id)}
                    className="text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <h3 className="text-gray-800 font-semibold text-lg truncate w-full mb-1">
                {item.subCategoryName}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                Category: <span className="font-medium text-gray-700">{getCategoryName(item.categoryId)}</span>
              </p>
            </div>
          ))}
          {currentItems.length === 0 && (
             <div className="col-span-full text-center py-10 text-gray-500">No subcategories found.</div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2 mt-4 text-gray-500">
          <span className="cursor-pointer hover:text-black" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}>←</span>
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => handlePageChange(idx + 1)}
              className={`w-8 h-8 flex items-center justify-center rounded-md ${
                currentPage === idx + 1 ? "bg-blue-100 text-blue-600 font-medium" : "hover:bg-gray-100"
              }`}
            >
              {idx + 1}
            </button>
          ))}
          <span className="cursor-pointer hover:text-black" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}>→</span>
          <span className="ml-auto text-sm">{filteredItems.length} Results</span>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{editingSubCategory ? "Edit SubCategory" : "Add SubCategory"}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                <select
                  {...register("categoryId", { required: "Category is required", valueAsNumber: true })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a category</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                  ))}
                </select>
                {errors.categoryId && <span className="text-red-500 text-sm">{errors.categoryId.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SubCategory Name</label>
                <input
                  type="text"
                  {...register("subCategoryName", { required: "Name is required" })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Smart Phones"
                />
                {errors.subCategoryName && <span className="text-red-500 text-sm">{errors.subCategoryName.message}</span>}
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-semibold mb-2 text-gray-900">Delete Item</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
