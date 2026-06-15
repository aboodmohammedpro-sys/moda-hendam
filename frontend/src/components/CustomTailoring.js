'use client';

import { useState, useEffect } from 'react';

export default function CustomTailoring() {
  const [step, setStep] = useState(1);
  const [designs, setDesigns] = useState([]);
  const [fabrics, setFabrics] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [selectedFabric, setSelectedFabric] = useState(null);
  const [selectedMeasurement, setSelectedMeasurement] = useState(null);
  
  const [customDetails, setCustomDetails] = useState({
    collar: 'كلاسيكي',
    buttons: 'مخفية',
    pocket: 'بدون جيب',
    sleeves: 'كلاسيكي'
  });
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Fetch designs
        const designsRes = await fetch('http://localhost:8000/api/v1/tailoring/designs', {
          headers: { 'Accept': 'application/json' }
        });
        if (designsRes.ok) {
          const designsData = await designsRes.json();
          setDesigns(designsData);
        }

        // Fetch fabrics
        const fabricsRes = await fetch('http://localhost:8000/api/v1/tailoring/fabrics', {
          headers: { 'Accept': 'application/json' }
        });
        if (fabricsRes.ok) {
          const fabricsData = await fabricsRes.json();
          setFabrics(fabricsData);
        }

        // Fetch measurements
        const measurementsRes = await fetch('http://localhost:8000/api/v1/tailoring/measurements', {
          headers: { 'Accept': 'application/json' }
        });
        if (measurementsRes.ok) {
          const measurementsData = await measurementsRes.json();
          setMeasurements(measurementsData);
        }
      } catch (err) {
        console.error('Error loading data', err);
        setError('حدث خطأ في تحميل البيانات من الخادم.');
      }
    };

    loadInitialData();
  }, []);

  const handleCustomDetailsChange = (key, value) => {
    setCustomDetails(prev => ({ ...prev, [key]: value }));
  };

  const calculateSubtotal = () => {
    if (!selectedDesign || !selectedFabric) return 0;
    const fabricPrice = parseFloat(selectedFabric.price_per_meter || 0);
    const designPrice = parseFloat(selectedDesign.base_tailoring_price || 0);
    return designPrice + (fabricPrice * 3.5);
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    const subtotal = calculateSubtotal();
    if (appliedCoupon.type === 'fixed') {
      return parseFloat(appliedCoupon.value);
    } else if (appliedCoupon.type === 'percentage') {
      let discount = subtotal * (parseFloat(appliedCoupon.value) / 100);
      if (appliedCoupon.max_discount) {
        discount = Math.min(discount, parseFloat(appliedCoupon.max_discount));
      }
      return discount;
    }
    return 0;
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError('');
    setAppliedCoupon(null);

    try {
      const res = await fetch('http://localhost:8000/api/v1/tailoring/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ code: couponCode })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAppliedCoupon(data.coupon);
        setCouponError('');
      } else {
        setCouponError(data.message || 'الكوبون غير صالح.');
      }
    } catch (err) {
      console.error(err);
      setCouponError('خطأ في الاتصال بالخادم.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedDesign) return setError('الرجاء اختيار تصميم أولاً.');
    if (!selectedMeasurement) return setError('الرجاء تحديد مقاساتك.');
    if (!selectedFabric) return setError('الرجاء اختيار القماش.');
    if (!address.trim()) return setError('الرجاء إدخال عنوان التوصيل.');

    setLoading(true);
    setError('');

    const subtotal = calculateSubtotal();
    const discountAmount = calculateDiscount();
    const calculatedUnitPrice = Math.max(0, subtotal - discountAmount);

    const orderPayload = {
      type: 'tailoring',
      shipping_address: address,
      notes: appliedCoupon 
        ? `${notes} (كود الخصم: ${appliedCoupon.code} - خصم بقيمة ${discountAmount.toFixed(2)} ر.س)`
        : notes,
      items: [
        {
          product_id: selectedFabric.id,
          design_id: selectedDesign.id,
          measurement_id: selectedMeasurement.id,
          quantity: 1,
          unit_price: calculatedUnitPrice,
          custom_details: {
            ...customDetails,
            fabric_meters: 3.5
          }
        }
      ]
    };

    try {
      const res = await fetch('http://localhost:8000/api/v1/tailoring/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // 'Authorization': `Bearer YOUR_AUTH_TOKEN`
        },
        body: JSON.stringify(orderPayload)
      });

      if (res.ok) {
        setSuccess(true);
        setStep(5); // Show success screen
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'حدث خطأ أثناء إرسال طلب التفصيل.');
      }
    } catch (err) {
      console.error(err);
      setError('خطأ في الاتصال بالخادم. الرجاء المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto p-8 bg-white shadow-xl rounded-2xl text-center mt-12" dir="rtl">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">تم إرسال طلب التفصيل بنجاح!</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          لقد تلقينا طلب التفصيل الخاص بك. يمكنك الآن التواصل مباشرة مع الخياط عبر نظام المحادثة لتأكيد تفاصيل ومراحل الخياطة.
        </p>
        <button
          onClick={() => {
            setSuccess(false);
            setStep(1);
            setSelectedDesign(null);
            setSelectedFabric(null);
            setSelectedMeasurement(null);
            setAddress('');
            setNotes('');
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition duration-200"
        >
          تفصيل ثوب جديد
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-2xl mt-10" dir="rtl">
      {/* Progress Stepper */}
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        {[
          { num: 1, label: 'اختيار التصميم' },
          { num: 2, label: 'المقاسات' },
          { num: 3, label: 'اختيار القماش' },
          { num: 4, label: 'التخصيص والطلب' }
        ].map((s) => (
          <div key={s.num} className="flex flex-col items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mb-2 transition-colors duration-200 ${
              step === s.num
                ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                : step > s.num
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-400'
            }`}>
              {step > s.num ? '✓' : s.num}
            </div>
            <span className={`text-sm font-medium ${step === s.num ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 font-medium border border-red-100">
          {error}
        </div>
      )}

      {/* Step 1: Select Design */}
      {step === 1 && (
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-6">اختر الموديل أو التصميم المراد تفصيله:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {designs.map((design) => (
              <div
                key={design.id}
                onClick={() => setSelectedDesign(design)}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                  selectedDesign?.id === design.id
                    ? 'border-blue-600 bg-blue-50/50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div>
                  <h4 className="font-bold text-xl text-gray-800 mb-2">{design.title}</h4>
                  <p className="text-gray-500 text-sm mb-4">
                    المقاسات المطلوبة: {design.required_measurements_keys?.join(', ')}
                  </p>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-lg font-bold text-blue-600">{design.base_tailoring_price} ر.س</span>
                  <span className="text-sm font-medium text-gray-400">سعر التفصيل الأساسي</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => {
                if (!selectedDesign) return alert('الرجاء تحديد تصميم للمتابعة.');
                setStep(2);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition duration-200"
            >
              التالي (المقاسات)
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Select Measurement Profile */}
      {step === 2 && (
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-6">اختر مقاسك المحفوظ:</h3>
          {measurements.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl border">
              <p className="text-gray-500 mb-4">لم تقم بإضافة أي مقاسات حتى الآن.</p>
              <p className="text-sm text-gray-400">يرجى الذهاب لـ "واجهة المقاسات" وحفظ مقاساتك أولاً لتتمكن من إتمام التفصيل.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {measurements.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedMeasurement(m)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedMeasurement?.id === m.id
                      ? 'border-blue-600 bg-blue-50/50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h4 className="font-bold text-gray-800 mb-2">{m.label}</h4>
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
                    {Object.entries(m.values || {}).map(([key, val]) => (
                      <span key={key} className="bg-gray-100 px-2 py-1 rounded">
                        {key}: {val}سم
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="border border-gray-300 text-gray-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-xl transition duration-200"
            >
              السابق
            </button>
            <button
              onClick={() => {
                if (!selectedMeasurement) return alert('الرجاء تحديد مقاساتك للمتابعة.');
                setStep(3);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition duration-200"
            >
              التالي (اختيار القماش)
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Select Fabric */}
      {step === 3 && (
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-6">اختر القماش الذي تفضله:</h3>
          {fabrics.length === 0 ? (
            <p className="text-gray-500 text-center py-6">لا تتوفر أقمشة متاحة حالياً.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fabrics.map((fabric) => (
                <div
                  key={fabric.id}
                  onClick={() => setSelectedFabric(fabric)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${
                    selectedFabric?.id === fabric.id
                      ? 'border-blue-600 bg-blue-50/50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-gray-800">{fabric.name}</h4>
                    <p className="text-sm text-gray-500">اللون: {fabric.color} | النقشة: {fabric.pattern || 'سادة'}</p>
                    <p className="text-xs text-green-600 font-medium mt-1">المخزون المتوفر: {fabric.stock_meters} متر</p>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{fabric.price_per_meter} ر.س / للمتر</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="border border-gray-300 text-gray-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-xl transition duration-200"
            >
              السابق
            </button>
            <button
              onClick={() => {
                if (!selectedFabric) return alert('الرجاء اختيار القماش للمتابعة.');
                setStep(4);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition duration-200"
            >
              التالي (التخصيص)
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Custom Details & Checkout */}
      {step === 4 && (
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-6">أضف لمساتك وتفاصيل الخياطة:</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Style Customization */}
            <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <h4 className="font-bold text-lg text-gray-700 mb-2 border-b pb-2">تفاصيل التصميم</h4>
              
              <div>
                <label className="block text-gray-700 mb-2 font-medium">ستايل الرقبة / الياقة</label>
                <select
                  value={customDetails.collar}
                  onChange={(e) => handleCustomDetailsChange('collar', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="كلاسيكي">كلاسيكي</option>
                  <option value="مرتفعة (سعودي)">مرتفعة (سعودي)</option>
                  <option value="مفتوحة (قطري)">مفتوحة (قطري)</option>
                  <option value="مستديرة">مستديرة</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">نوع الأزرار</label>
                <select
                  value={customDetails.buttons}
                  onChange={(e) => handleCustomDetailsChange('buttons', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="مخفية">مخفية</option>
                  <option value="ظاهرة ملونة">ظاهرة ملونة</option>
                  <option value="طقطق">طقطق</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">الجيب</label>
                <select
                  value={customDetails.pocket}
                  onChange={(e) => handleCustomDetailsChange('pocket', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="بدون جيب">بدون جيب</option>
                  <option value="جيب أمامي يسار">جيب أمامي يسار</option>
                  <option value="جيبين جانبيين">جيبين جانبيين</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">ستايل الأكمام</label>
                <select
                  value={customDetails.sleeves}
                  onChange={(e) => handleCustomDetailsChange('sleeves', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="كلاسيكي">كلاسيكي</option>
                  <option value="كبك (للأزرار الفاخرة)">كبك (للأزرار الفاخرة)</option>
                  <option value="مفتوح واسع">مفتوح واسع</option>
                </select>
              </div>
            </div>

            {/* Delivery & Summary */}
            <div className="space-y-4">
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <h4 className="font-bold text-lg text-blue-800 mb-3">ملخص الفاتورة</h4>
                <div className="flex justify-between mb-2 text-gray-600 bg-white/40 p-2 rounded-lg">
                  <span>موديل: {selectedDesign?.title}</span>
                  <span>{selectedDesign?.base_tailoring_price} ر.س</span>
                </div>
                <div className="flex justify-between mb-2 text-gray-600 bg-white/40 p-2 rounded-lg">
                  <span>قماش: {selectedFabric?.name} (3.5 متر)</span>
                  <span>{(parseFloat(selectedFabric?.price_per_meter || 0) * 3.5).toFixed(2)} ر.س</span>
                </div>
                
                {appliedCoupon && (
                  <div className="flex justify-between mb-2 text-green-700 font-bold bg-green-50/50 p-2 rounded-lg border border-green-100">
                    <span>خصم الكوبون ({appliedCoupon.code})</span>
                    <span>-{calculateDiscount().toFixed(2)} ر.س</span>
                  </div>
                )}

                <div className="flex justify-between mb-2 text-gray-600 bg-white/40 p-2 rounded-lg">
                  <span>التوصيل والشحن</span>
                  <span className="text-green-600 font-bold">مجاني</span>
                </div>
                <div className="flex justify-between mt-4 border-t pt-4 font-bold text-xl text-blue-950">
                  <span>الإجمالي المتوقع</span>
                  <span>{Math.max(0, calculateSubtotal() - calculateDiscount()).toFixed(2)} ر.س</span>
                </div>
              </div>

              {/* Coupon Section */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <label className="block text-sm text-gray-700 mb-2 font-medium">كوبون الخصم</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="رمز الكوبون..."
                    className="flex-grow px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase bg-white"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
                  >
                    {couponLoading ? '...' : 'تطبيق'}
                  </button>
                </div>
                {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                {appliedCoupon && <p className="text-xs text-green-600 mt-1">✓ تم تطبيق كود الخصم بنجاح.</p>}
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">عنوان التوصيل بالتفصيل</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  rows="2"
                  placeholder="المدينة، الحي، الشارع، المبنى..."
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">ملاحظات للخياط (اختياري)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  rows="2"
                  placeholder="مثال: أرغب بطول رقبة أقصر قليلاً..."
                ></textarea>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setStep(3)}
              className="border border-gray-300 text-gray-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-xl transition duration-200"
            >
              السابق
            </button>
            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition duration-200"
            >
              {loading ? 'جاري إرسال الطلب...' : 'تأكيد وإرسال طلب التفصيل'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
