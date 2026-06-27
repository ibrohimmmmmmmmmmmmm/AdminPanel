import React, { useEffect } from "react";
import { useProductStore } from "./Product";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function AddProductDetails() {
  const navigate = useNavigate();
  const { addProduct, brands, colors, subCategories, fetchMetadata } = useProductStore();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  const onSubmit = async (data: any) => {
    const formData = new FormData();
    formData.append("BrandId", data.BrandId || 0);
    formData.append("Code", data.Code || "");
    formData.append("ColorId", data.ColorId || 0);
    formData.append("Description", data.Description || "");
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
      navigate("/admin/products");
    }
  };

  return (
    <div className="p-6 bg-gray-50 w-full min-h-screen">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center p-6 border-b border-gray-100 bg-white">
          <button onClick={() => navigate("/admin/products")} className="mr-4 text-gray-400 hover:text-gray-600 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
              <input
                {...register("ProductName", { required: true })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
                placeholder="Enter product name"
              />
              {errors.ProductName && <span className="text-red-500 text-xs mt-1">This field is required</span>}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Price ($)</label>
              <input type="number" step="0.01" {...register("Price", { required: true })} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow" placeholder="0.00" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
              <input type="number" {...register("Quantity", { required: true })} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow" placeholder="0" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Product Code</label>
              <input {...register("Code")} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow" placeholder="e.g. PRD-001" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Brand</label>
              <select {...register("BrandId", { required: true })} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white transition-shadow">
                <option value="">Select Brand</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.brandName}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
              <select {...register("ColorId", { required: true })} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white transition-shadow">
                <option value="">Select Color</option>
                {colors.map(c => <option key={c.id} value={c.id}>{c.colorName}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Subcategory</label>
              <select {...register("SubCategoryId", { required: true })} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white transition-shadow">
                <option value="">Select Subcategory</option>
                {subCategories.map(sc => <option key={sc.id} value={sc.id}>{sc.subCategoryName}</option>)}
              </select>
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea {...register("Description")} rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow resize-none" placeholder="Enter product description"></textarea>
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Product Images</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-blue-400 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-3 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF</p>
                  </div>
                  <input type="file" multiple {...register("Images")} className="hidden" />
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button type="button" onClick={() => navigate("/admin/products")} className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2.5 bg-blue-600 rounded-lg text-white hover:bg-blue-700 font-semibold shadow-sm shadow-blue-200 transition-colors">Save Product</button>
          </div>
        </form>
      </div>
    </div>
  );
}
