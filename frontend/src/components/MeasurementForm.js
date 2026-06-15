'use client';

import { useState } from 'react';
import useMeasurementStore from '../store/useMeasurementStore';

export default function MeasurementForm() {
  const { measurements, setMeasurement } = useMeasurementStore();
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);

  const fields = [
    { key: 'chest', label: 'محيط الصدر (سم)' },
    { key: 'waist', label: 'محيط الخصر (سم)' },
    { key: 'shoulder', label: 'عرض الكتف (سم)' },
    { key: 'sleeve', label: 'طول الكم (سم)' },
    { key: 'length', label: 'الطول الكلي (سم)' },
  ];

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Replace with dynamic backend URL and dynamic user token
      const response = await fetch('http://localhost:8000/api/v1/tailoring/measurements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // 'Authorization': `Bearer YOUR_AUTH_TOKEN`
        },
        body: JSON.stringify({
          label: label || 'مقاساتي الأساسية',
          values: measurements
        })
      });

      if (response.ok) {
        alert('تم حفظ المقاسات بنجاح!');
      } else {
        alert('حدث خطأ أثناء الحفظ.');
      }
    } catch (error) {
      console.error(error);
      alert('خطأ في الاتصال بالخادم.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-10" dir="rtl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">أدخل مقاساتك بدقة</h2>
      
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-gray-700 mb-2 font-medium">اسم ملف المقاس (مثل: مقاس الصيف)</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="مقاساتي الأساسية"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-gray-700 mb-2">{field.label}</label>
              <input
                type="number"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={measurements[field.key] || ''}
                onChange={(e) => setMeasurement(field.key, e.target.value)}
                placeholder="0"
                required
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
        >
          {loading ? 'جاري الحفظ...' : 'حفظ المقاسات'}
        </button>
      </form>
    </div>
  );
}
