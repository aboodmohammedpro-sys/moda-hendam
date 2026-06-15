'use client';

import { useState } from 'react';
import MeasurementForm from '../components/MeasurementForm';
import FabricManager from '../components/FabricManager';
import ProductList from '../components/ProductList';
import Cart from '../components/Cart';

export default function Home() {
  const [activeTab, setActiveTab] = useState('products');

  const renderContent = () => {
    switch (activeTab) {
      case 'measurements': return <MeasurementForm />;
      case 'fabric': return <FabricManager shopId="1" />;
      case 'products': return <ProductList />;
      case 'cart': return <Cart />;
      default: return <ProductList />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-blue-600">موضة هندام (نسخة العرض التجريبية)</h1>
          <nav className="flex flex-wrap justify-center gap-2">
            <button onClick={() => setActiveTab('products')} className={`px-4 py-2 font-medium rounded-lg transition ${activeTab === 'products' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 border'}`}>المنتجات الجاهزة</button>
            <button onClick={() => setActiveTab('cart')} className={`px-4 py-2 font-medium rounded-lg transition ${activeTab === 'cart' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 border'}`}>سلة التسوق</button>
            <button onClick={() => setActiveTab('measurements')} className={`px-4 py-2 font-medium rounded-lg transition ${activeTab === 'measurements' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 border'}`}>واجهة المقاسات</button>
            <button onClick={() => setActiveTab('fabric')} className={`px-4 py-2 font-medium rounded-lg transition ${activeTab === 'fabric' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 border'}`}>إدارة الأقمشة (للتاجر)</button>
          </nav>
        </div>
      </header>

      <main className="py-8">
        {renderContent()}
      </main>
    </div>
  );
}
