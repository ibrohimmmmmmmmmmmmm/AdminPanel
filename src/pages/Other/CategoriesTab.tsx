import React, { useEffect, useState } from "react";
import { useCategoryStore } from "./CategoryZustand";
import { Edit2, Plus, Search, Trash2, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

interface CategoryFormData {
  id?: number;
  categoryName: string;
  categoryImage: FileList;
}

export const CategoriesTab = () => {
  const { categories, getCategories, addCategory, updateCategory, deleteCategory, loading } = useCategoryStore();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // As seen in the image, maybe a 6x2 grid or similar
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryFormData>();

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  // Filtering
  const filteredCategories = categories?.filter(cat => 
    cat.categoryName?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  // Pagination
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

  const openModal = (category?: any) => {
    if (category) {
      setEditingCategory(category);
      reset({
        id: category.id,
        categoryName: category.categoryName,
        // can't easily set file input, will leave it empty and only update if user selects new file
      });
    } else {
      setEditingCategory(null);
      reset({ categoryName: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    reset();
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("CategoryName", data.categoryName);
      
      if (editingCategory) {
        formData.append("Id", editingCategory.id.toString());
        if (data.categoryImage && data.categoryImage.length > 0) {
          formData.append("CategoryImage", data.categoryImage[0]);
        } else if (editingCategory.categoryImage) {
          try {
            // Using Vite proxy to bypass CORS
            const response = await fetch(`/api-proxy/images/${editingCategory.categoryImage}`);
            if (!response.ok) throw new Error("Network response was not ok");
            const blob = await response.blob();
            // Append as File so backend validation passes
            formData.append("CategoryImage", new File([blob], editingCategory.categoryImage, { type: blob.type || "image/jpeg" }));
          } catch (e) {
            console.error("Failed to fetch existing image through proxy", e);
            // If it still fails, the user will just have to select a new image, 
            // but we won't send an empty string so they see the real backend error.
          }
        }
        await updateCategory(formData);
        toast.success("Category updated successfully");
      } else {
        if (!data.categoryImage || data.categoryImage.length === 0) {
          toast.error("Image is required");
          return;
        }
        formData.append("CategoryImage", data.categoryImage[0]);
        await addCategory(formData);
        toast.success("Category added successfully");
      }
      closeModal();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    setCategoryToDelete(id);
  };

  const confirmDelete = async () => {
    if (categoryToDelete === null) return;
    try {
      await deleteCategory(categoryToDelete);
      toast.success("Category deleted");
    } catch (error: any) {
      toast.error("Failed to delete category");
    } finally {
      setCategoryToDelete(null);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Search and Add */}
      <div className="flex items-center justify-between">
        <div className="relative w-80">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // Reset to page 1 on search
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {currentCategories.map((category) => (
            <div key={category.id} className="border rounded-xl p-4 flex flex-col items-center relative group hover:shadow-md transition-shadow">
              <button 
                onClick={() => openModal(category)}
                className="absolute top-2 right-2 text-blue-500 hover:bg-blue-50 p-1.5 rounded-full transition-colors"
              >
                <Edit2 size={16} />
              </button>
              
              <div className="w-16 h-16 flex items-center justify-center mb-4 mt-2">
                {category.categoryImage ? (
                  <img 
                    src={`${import.meta.env.VITE_BASE_URL}/images/${category.categoryImage}`} 
                    alt={category.categoryName} 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=Icon';
                    }}
                  />
                ) : (
                  <ImageIcon size={40} className="text-gray-400" />
                )}
              </div>
              
              <h3 className="text-gray-800 font-medium text-center truncate w-full">
                {category.categoryName}
              </h3>

              {/* Optional delete button on hover, not in design but good for CRUD */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(category.id);
                }}
                className="absolute top-2 left-2 text-red-500 hover:bg-red-50 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
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
          <span className="ml-auto text-sm">{filteredCategories.length} Results</span>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{editingCategory ? "Edit Category" : "Add Category"}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  {...register("categoryName", { required: "Name is required" })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Phones"
                />
                {errors.categoryName && <span className="text-red-500 text-sm">{errors.categoryName.message}</span>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Image</label>
                {editingCategory && editingCategory.categoryImage && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Current Image:</p>
                    <img 
                      src={`${import.meta.env.VITE_BASE_URL}/images/${editingCategory.categoryImage}`} 
                      alt="Current" 
                      className="w-16 h-16 object-contain border rounded-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=Error';
                      }}
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  {...register("categoryImage")}
                  className="w-full border rounded-lg px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {editingCategory && <p className="text-xs text-gray-500 mt-1">Leave empty to keep existing image</p>}
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {categoryToDelete !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-semibold mb-2 text-gray-900">Delete Category</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this category? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCategoryToDelete(null)}
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
