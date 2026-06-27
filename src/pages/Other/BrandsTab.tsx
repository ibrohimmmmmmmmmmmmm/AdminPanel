import React, { useEffect, useState } from "react";
import { useBrandStore } from "./BrandZustand";
import { Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

interface BrandFormData {
  brandName: string;
}

const ITEMS_PER_PAGE = 5;

export const BrandsTab = () => {
  const { brands, getBrands, addBrand, updateBrand, deleteBrand, loading } = useBrandStore();
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [brandToDelete, setBrandToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BrandFormData>();

  useEffect(() => {
    getBrands();
  }, [getBrands]);

  const totalPages = Math.max(1, Math.ceil((brands?.length || 0) / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBrands = (brands || []).slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const pageNumbers: (number | "dots")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pageNumbers.push(i);
    } else if (pageNumbers[pageNumbers.length - 1] !== "dots") {
      pageNumbers.push("dots");
    }
  }

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const onSubmit = async (data: BrandFormData) => {
    try {
      if (editingBrand) {
        await updateBrand(editingBrand.id, data.brandName);
        toast.success("Brand updated successfully");
        setEditingBrand(null);
      } else {
        await addBrand(data.brandName);
        toast.success("Brand added successfully");
        setCurrentPage(1);
      }
      reset({ brandName: "" });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const handleEdit = (brand: any) => {
    setEditingBrand(brand);
    reset({ brandName: brand.brandName });
  };

  const cancelEdit = () => {
    setEditingBrand(null);
    reset({ brandName: "" });
  };

  const handleDelete = (id: number) => {
    setBrandToDelete(id);
  };

  const confirmDelete = async () => {
    if (brandToDelete === null) return;
    try {
      await deleteBrand(brandToDelete);
      toast.success("Brand deleted");
      if (paginatedBrands.length === 1 && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      }
    } catch (error: any) {
      toast.error("Failed to delete brand");
    } finally {
      setBrandToDelete(null);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .brand-row {
          opacity: 0;
          animation: fadeUp 0.4s ease forwards;
        }
        .page-btn {
          min-width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 500;
          color: #475569;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
          cursor: pointer;
        }
        .page-btn:hover:not(:disabled):not(.is-active) {
          background: #f1f5f9;
          border-color: #cbd5e1;
          transform: translateY(-2px);
        }
        .page-btn.is-active {
          background: #131a2e;
          color: #fff;
          border-color: #131a2e;
          box-shadow: 0 8px 16px -4px rgba(19, 26, 46, 0.4);
          transform: scale(1.05);
        }
        .page-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
        .page-dots {
          width: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          font-size: 14px;
          letter-spacing: 1px;
        }
      `}</style>

      {/* Left Column - List of Brands */}
      <div className="flex-1 max-w-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-3 font-medium text-gray-500">Brands</th>
              <th className="py-3 font-medium text-gray-500 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={2} className="py-4 text-center text-gray-500">Loading...</td>
              </tr>
            ) : paginatedBrands.length > 0 ? (
              paginatedBrands.map((brand, i) => (
                <tr
                  key={brand.id}
                  className="brand-row border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <td className="py-4 font-medium text-gray-800">{brand.brandName}</td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => handleEdit(brand)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(brand.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="py-4 text-center text-gray-500">No brands found</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {!loading && brands?.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-700">{startIndex + 1}</span>–
              <span className="font-medium text-gray-700">
                {Math.min(startIndex + ITEMS_PER_PAGE, brands.length)}
              </span>{" "}
              of <span className="font-medium text-gray-700">{brands.length}</span>
            </p>

            <div className="flex items-center gap-2">
              <button
                className="page-btn"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </button>

              {pageNumbers.map((p, idx) =>
                p === "dots" ? (
                  <div key={`dots-${idx}`} className="page-dots">⋯</div>
                ) : (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`page-btn ${currentPage === p ? "is-active" : ""}`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                className="page-btn"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Column - Add/Edit Form */}
      <div className="flex-1 max-w-md">
        <div className="border rounded-xl p-6 bg-white shadow-sm sticky top-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {editingBrand ? "Edit brand" : "Add new brand"}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <input
                type="text"
                {...register("brandName", { required: "Brand name is required" })}
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
                placeholder="Brand name"
              />
              {errors.brandName && <span className="text-red-500 text-sm mt-1 block">{errors.brandName.message}</span>}
            </div>

            <div className="flex justify-end gap-3 mt-2">
              {editingBrand && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-6 py-2 border text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {editingBrand ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {brandToDelete !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-semibold mb-2 text-gray-900">Delete Brand</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this brand? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setBrandToDelete(null)}
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