'use client';

import { useState, useEffect, useRef } from 'react';

export default function OrderChat() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [chat, setChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  
  const messagesEndRef = useRef(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/tailoring/orders', {
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
      setError('خطأ في جلب الطلبات.');
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openChat = async (order) => {
    setSelectedOrder(order);
    setLoadingChat(true);
    setChat(null);
    setError('');
    
    try {
      const res = await fetch(`http://localhost:8000/api/v1/chat/orders/${order.id}/chat`, {
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        setChat(data);
      } else {
        setError('تعذر تحميل المحادثة.');
      }
    } catch (err) {
      console.error(err);
      setError('خطأ في الاتصال بالخادم.');
    } finally {
      setLoadingChat(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (chat) {
      scrollToBottom();
    }
  }, [chat]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !attachment) return;

    setSending(true);
    setError('');

    const formData = new FormData();
    if (newMessage.trim()) formData.append('message', newMessage);
    if (attachment) formData.append('attachment', attachment);

    try {
      const res = await fetch(`http://localhost:8000/api/v1/chat/chats/${chat.id}/messages`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          // 'Authorization': `Bearer TOKEN`
        },
        body: formData
      });

      if (res.ok) {
        const msg = await res.json();
        setChat(prev => ({
          ...prev,
          messages: [...(prev.messages || []), msg]
        }));
        setNewMessage('');
        setAttachment(null);
      } else {
        setError('فشل إرسال الرسالة.');
      }
    } catch (err) {
      console.error(err);
      setError('خطأ في الاتصال.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-xl rounded-2xl mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]" dir="rtl">
      
      {/* Right Column: Orders List */}
      <div className="border-l pl-4 flex flex-col h-full overflow-hidden">
        <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">طلباتي النشطة</h3>
        {loadingOrders ? (
          <div className="text-gray-500 py-4 text-center">جاري تحميل الطلبات...</div>
        ) : orders.length === 0 ? (
          <div className="text-gray-400 py-4 text-center">لا توجد لديك طلبات حالية.</div>
        ) : (
          <div className="flex-grow overflow-y-auto space-y-3 pr-1">
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => openChat(order)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  selectedOrder?.id === order.id
                    ? 'border-blue-600 bg-blue-50/40 shadow-sm'
                    : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-gray-800">طلب {order.type === 'tailoring' ? 'تفصيل' : 'منتج جاهز'}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    order.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {order.status === 'pending' ? 'نشط' : order.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-2">تاريخ الطلب: {new Date(order.created_at).toLocaleDateString('ar-SA')}</p>
                <div className="flex justify-between items-center text-sm font-semibold text-blue-600">
                  <span>الإجمالي: {order.total_amount} ر.س</span>
                  <span className="text-xs font-bold underline">افتح المحادثة ←</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Left Column: Chat Area */}
      <div className="md:col-span-2 flex flex-col h-full overflow-hidden relative">
        {selectedOrder ? (
          <>
            {/* Chat Header */}
            <div className="pb-4 border-b mb-4 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-800">المحادثة الخاصة بالطلب</h3>
                <p className="text-xs text-gray-500">معمل الخياطة / المتجر</p>
              </div>
              <span className="text-xs bg-gray-100 px-3 py-1 rounded-lg text-gray-600 font-medium">
                معرف الطلب: {selectedOrder.id.substring(0, 8)}...
              </span>
            </div>

            {/* Error banner */}
            {error && (
              <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-3 border border-red-100">
                {error}
              </div>
            )}

            {/* Messages Container */}
            <div className="flex-grow overflow-y-auto mb-4 space-y-4 pr-2 bg-gray-50/40 p-4 rounded-2xl border border-gray-100">
              {loadingChat ? (
                <div className="text-center text-gray-500 py-10">جاري تحميل الرسائل...</div>
              ) : chat?.messages?.length === 0 ? (
                <div className="text-center text-gray-400 py-10">
                  لا توجد رسائل سابقة. أرسل رسالة للخياط لبدء التنسيق.
                </div>
              ) : (
                chat?.messages?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[70%] rounded-2xl p-4 ${
                      msg.sender_id === selectedOrder.customer_id
                        ? 'bg-blue-600 text-white mr-auto rounded-bl-none'
                        : 'bg-white text-gray-800 ml-auto rounded-br-none border shadow-sm'
                    }`}
                  >
                    <span className="text-[10px] font-bold opacity-75 mb-1">
                      {msg.sender?.name || 'مستخدم'}
                    </span>
                    {msg.message && <p className="text-sm leading-relaxed">{msg.message}</p>}
                    {msg.attachment_path && (
                      <div className="mt-2 rounded-lg overflow-hidden border bg-gray-100 max-h-40">
                        <img
                          src={`http://localhost:8000${msg.attachment_path}`}
                          alt="Attachment"
                          className="object-contain w-full h-full"
                        />
                      </div>
                    )}
                    <span className="text-[9px] opacity-60 mt-1 align-self-end text-left">
                      {new Date(msg.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Form */}
            <form onSubmit={handleSendMessage} className="space-y-2 mt-auto">
              {attachment && (
                <div className="flex items-center justify-between bg-blue-50 text-blue-800 text-xs px-3 py-1.5 rounded-lg border">
                  <span>تم إرفاق صورة: {attachment.name}</span>
                  <button type="button" onClick={() => setAttachment(null)} className="text-red-500 font-bold hover:underline">إلغاء</button>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-grow px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-12 bg-white text-sm"
                  placeholder="اكتب رسالة أو استفسار للخياط..."
                ></textarea>
                
                {/* File Attachment Icon Button */}
                <label className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-3 rounded-xl cursor-pointer transition-colors duration-200 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAttachment(e.target.files[0])}
                    className="hidden"
                  />
                </label>

                <button
                  type="submit"
                  disabled={sending}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition duration-200 flex items-center justify-center h-12"
                >
                  {sending ? '...' : 'إرسال'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <p className="text-lg">الرجاء اختيار أحد طلباتك لبدء المحادثة والتنسيق مع الخياط.</p>
          </div>
        )}
      </div>

    </div>
  );
}
