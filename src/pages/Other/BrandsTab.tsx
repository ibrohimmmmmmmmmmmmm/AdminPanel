import React, { useEffect, useState } from "react";
import { useBrandStore } from "./BrandZustand";
import { Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

interface BrandFormData {
  brandName: string;
}

export const BrandsTab = () => {
  const { brands, getBrands, addBrand, updateBrand, deleteBrand, loading } = useBrandStore();
  const [editingBrand, setEditingBrand] = useState<any>(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<BrandFormData>();

  useEffect(() => {
    getBrands();
  }, [getBrands]);

  const onSubmit = async (data: BrandFormData) => {
    try {
      if (editingBrand) {
        await updateBrand(editingBrand.id, data.brandName);
        toast.success("Brand updated successfully");
        setEditingBrand(null);
      } else {
        await addBrand(data.brandName);
        toast.success("Brand added successfully");
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

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this brand?")) {
      try {
        await deleteBrand(id);
        toast.success("Brand deleted");
      } catch (error: any) {
        toast.error("Failed to delete brand");
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
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
            ) : brands?.length > 0 ? (
              brands.map((brand) => (
                <tr key={brand.id} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
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
    </div>
  );
};
