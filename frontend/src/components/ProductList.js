'use client';

import { useState, useEffect } from 'react';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/v1/tailoring/products', {
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Error fetching products', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div className="text-center py-10" dir="rtl">جاري تحميل المنتجات...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 mt-10" dir="rtl">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-blue-500 pb-2 inline-block">المنتجات الجاهزة</h2>
      
      {products.length === 0 ? (
        <p className="text-gray-500 text-lg">لا توجد منتجات متاحة حالياً.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100 flex flex-col">
              <div className="h-48 bg-gray-200 w-full relative">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-gray-400">لا توجد صورة</div>
                )}
                {product.category && (
                  <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    {product.category}
                  </span>
                )}
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-lg text-gray-800 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{product.shop?.name || 'متجر الموضة'}</p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="font-bold text-xl text-blue-600">{product.price} ر.س</span>
                  <button className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                    أضف للسلة
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
