'use client';

import { useState } from 'react';
import useCartStore from '../store/useCartStore';

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCartStore();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return alert('السلة فارغة!');
    if (!address.trim()) return alert('الرجاء إدخال عنوان التوصيل');

    setLoading(true);

    const formattedItems = cartItems.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.price
    }));

    try {
      const res = await fetch('http://localhost:8000/api/v1/tailoring/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // 'Authorization': `Bearer YOUR_AUTH_TOKEN`
        },
        body: JSON.stringify({
          type: 'ready_made',
          items: formattedItems,
          shipping_address: address,
          notes: 'طلب من السلة'
        })
      });

      if (res.ok) {
        alert('تم إرسال طلبك بنجاح! شكراً لتسوقك معنا.');
        clearCart();
        setAddress('');
      } else {
        alert('حدث خطأ أثناء إتمام الطلب.');
      }
    } catch (error) {
      console.error(error);
      alert('خطأ في الاتصال بالخادم.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-10 bg-white rounded-xl shadow-lg text-center" dir="rtl">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">سلة التسوق</h2>
        <p className="text-gray-500 text-lg">سلتك فارغة حالياً. تسوق الآن!</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10 bg-white rounded-xl shadow-lg" dir="rtl">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-blue-500 pb-2 inline-block">سلة التسوق</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between border-b pb-4 mb-4">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                  {item.image_url ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-300"></div>}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{item.name}</h3>
                  <p className="text-blue-600 font-semibold">{item.price} ر.س</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200">-</button>
                <span className="font-medium text-lg w-6 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200">+</button>
                
                <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 mr-4 font-medium text-sm">
                  إزالة
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 h-fit">
          <h3 className="text-xl font-bold text-gray-800 mb-4">ملخص الطلب</h3>
          <div className="flex justify-between mb-2 text-gray-600">
            <span>المجموع الفرعي</span>
            <span>{getCartTotal()} ر.س</span>
          </div>
          <div className="flex justify-between mb-4 text-gray-600">
            <span>التوصيل</span>
            <span>مجاني</span>
          </div>
          <div className="flex justify-between mb-6 font-bold text-xl text-gray-800 border-t pt-4">
            <span>الإجمالي</span>
            <span>{getCartTotal()} ر.س</span>
          </div>

          <form onSubmit={handleCheckout}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">عنوان التوصيل</label>
              <textarea 
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                rows="3" 
                placeholder="أدخل عنوان التوصيل بالتفصيل (المدينة، الحي، الشارع، المبنى)..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              ></textarea>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
            >
              {loading ? 'جاري المعالجة...' : 'إتمام الطلب (Checkout)'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
