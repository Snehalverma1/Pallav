import React, { useState } from 'react';
import { useStore } from '../context/Store';

export const InquiryForm: React.FC = () => {
  const { currentUser, addInquiry, navigate } = useStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [inquiryType, setInquiryType] = useState<'buy' | 'sell'>('buy');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address) {
      setError('Please fill out all fields.');
      return;
    }
    const inquiry = { name, phone, address, inquiryType, message, userId: currentUser?.uid };
    const result = await addInquiry(inquiry);
    if (result === true) {
      setSuccess(true);
      setError('');
      setTimeout(() => {
        navigate({ name: 'USER_GALLERY' });
      }, 2000);
    } else {
      setError(result as string);
    }
  };

  if (success) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center gap-4 p-4 text-white">
        <h1 className="text-2xl font-bold">Thank you!</h1>
        <p>Your inquiry has been submitted successfully.</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center gap-4 p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mt-4">Submit an Inquiry</h1>
        <p className="text-slate-400">Let us know what you're looking for.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xs">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="p-2 rounded bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone Number"
          className="p-2 rounded bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
        />
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Address"
          className="p-2 rounded bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
        />
        <div className="flex gap-2">
          <button type="button" onClick={() => setInquiryType('buy')} className={`flex-1 p-2 rounded transition-colors ${inquiryType === 'buy' ? 'bg-blue-600' : 'bg-slate-800'} text-white`}>
            Buy
          </button>
          <button type="button" onClick={() => setInquiryType('sell')} className={`flex-1 p-2 rounded transition-colors ${inquiryType === 'sell' ? 'bg-slate-800' : 'bg-slate-800'} text-white`}>
            Sell
          </button>
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us more about what you're looking for..."
          className="p-2 rounded bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
        />
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors">
          Submit Inquiry
        </button>
      </form>
    </div>
  );
};
