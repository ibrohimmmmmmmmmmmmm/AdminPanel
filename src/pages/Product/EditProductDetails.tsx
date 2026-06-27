import React, { useEffect } from "react";
import { useProductStore, type Product } from "./Product";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function EditProductDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const product = location.state?.product as Product;

  const { updateProduct, brands, colors, subCategories, fetchMetadata } = useProductStore();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  useEffect(() => {
    if (product) {
      const brandIdFallback = product.brandId || brands.find(b => b.brandName === product.brandName)?.id || "";
      const colorIdFallback = product.colorId || colors.find(c => c.colorName === product.colorName)?.id || "";
      const subCategoryIdFallback = product.subCategoryId || subCategories.find(s => s.subCategoryName === product.subCategoryName)?.id || "";

      reset({
        ProductName: product.productName,
        Price: product.price,
        Quantity: product.quantity,
        Code: product.code,
        BrandId: brandIdFallback,
        ColorId: colorIdFallback,
        SubCategoryId: subCategoryIdFallback,
        HasDiscount: product.hasDiscount,
        Description: product.description,
      });
    } else {
      // If accessed directly without state, redirect to products
      navigate("/admin/products");
    }
  }, [product, reset, navigate, brands, colors, subCategories]);

  if (!product) return null;

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
          <h2 className="text-2xl font-bold text-gray-900">Edit Product: {product.productName}</h2>
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
              <input {...register("Code")} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow" placeholder="Product Code" />
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
            
            <div className="col-span-2 flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 rounded-lg">
              <input type="checkbox" id="EditHasDiscount" {...register("HasDiscount")} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <label htmlFor="EditHasDiscount" className="text-sm font-semibold text-gray-700 cursor-pointer">Has Discount?</label>
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea {...register("Description")} rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow resize-none" placeholder="Enter product description"></textarea>
            </div>
          </div>
          
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button type="button" onClick={() => navigate("/admin/products")} className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2.5 bg-blue-600 rounded-lg text-white hover:bg-blue-700 font-semibold shadow-sm shadow-blue-200 transition-colors">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
