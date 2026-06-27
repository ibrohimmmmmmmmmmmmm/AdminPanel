import React, { useState } from 'react';
import { CategoriesTab } from './CategoriesTab';
import { BrandsTab } from './BrandsTab';
import { BannersTab } from './BannersTab';

export default function Other() {
  const [activeTab, setActiveTab] = useState('Categories');

  const tabs = ['Categories', 'Brands', 'Banners'];

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex gap-4 mb-6 border-b border-gray-100 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
              activeTab === tab 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'Categories' && <CategoriesTab />}
        {activeTab === 'Brands' && <BrandsTab />}
        {activeTab === 'Banners' && <BannersTab />}
      </div>
    </div>
  );
}
