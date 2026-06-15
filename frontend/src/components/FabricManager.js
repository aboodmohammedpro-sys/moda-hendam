'use client';

import { useState, useEffect } from 'react';

export default function FabricManager({ shopId }) {
  const [fabrics, setFabrics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    color: '',
    pattern: '',
    price_per_meter: '',
    stock_meters: '',
  });

  const fetchFabrics = async () => {
    // In real app, you'd fetch from your Laravel API with Authorization header
    try {
      const res = await fetch('http://localhost:8000/api/v1/tailoring/fabrics', {
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        setFabrics(data);
      }
    } catch (error) {
      console.error('Error fetching fabrics', error);
    }
  };

  useEffect(() => {
    fetchFabrics();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddFabric = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('http://localhost:8000/api/v1/tailoring/fabrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // 'Authorization': `Bearer TOKEN`
        },
        body: JSON.stringify({
          ...formData,
          shop_id: shopId,
          status: 'active'
        })
      });

      if (res.ok) {
        alert('تم إضافة القماش بنجاح!');
        fetchFabrics(); // Refresh list
        setFormData({ name: '', color: '', pattern: '', price_per_meter: '', stock_meters: '' });
      } else {
        alert('حدث خطأ أثناء الإضافة.');
      }
    } catch (error) {
      console.error(error);
      alert('خطأ في الاتصال بالخادم.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-10" dir="rtl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">إدارة الأقمشة والمخزون</h2>
      
      {/* Form Section */}
      <form onSubmit={handleAddFabric} className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">إضافة قماش جديد</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">اسم القماش</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-gray-700 mb-2 font-medium">اللون</label>
            <input type="text" name="color" value={formData.color} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-gray-700 mb-2 font-medium">النقشة (اختياري)</label>
            <input type="text" name="pattern" value={formData.pattern} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-gray-700 mb-2 font-medium">سعر المتر (العملة)</label>
            <input type="number" step="0.01" name="price_per_meter" value={formData.price_per_meter} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-700 mb-2 font-medium">المخزون المتاح (بالمتر)</label>
            <input type="number" name="stock_meters" value={formData.stock_meters} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
        </div>
        <div className="mt-6">
          <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200">
            {loading ? 'جاري الإضافة...' : 'إضافة القماش للمتجر'}
          </button>
        </div>
      </form>

      {/* List Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-700">الأقمشة المتوفرة</h3>
        {fabrics.length === 0 ? (
          <p className="text-gray-500">لا يوجد أقمشة مضافة حالياً.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="p-3 border">الاسم</th>
                  <th className="p-3 border">اللون</th>
                  <th className="p-3 border">السعر</th>
                  <th className="p-3 border">المخزون</th>
                  <th className="p-3 border">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {fabrics.map((fabric) => (
                  <tr key={fabric.id} className="hover:bg-gray-50">
                    <td className="p-3 border">{fabric.name}</td>
                    <td className="p-3 border">{fabric.color}</td>
                    <td className="p-3 border">{fabric.price_per_meter}</td>
                    <td className="p-3 border">{fabric.stock_meters} متر</td>
                    <td className="p-3 border">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${fabric.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {fabric.status === 'active' ? 'متاح' : 'نفد'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
