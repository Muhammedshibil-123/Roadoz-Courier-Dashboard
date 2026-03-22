import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../lib/axios';

const AddMoney = () => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const predefinedAmounts = [1000, 5000, 10000, 25000];

  const handlePayment = async () => {
    if (!amount || isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      // 1. Create order on our backend
      const { data: orderData } = await api.post('/api/finance/create-razorpay-order/', { amount });
      
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Roadoz Courier",
        description: "Wallet Top-up",
        order_id: orderData.order_id,
        handler: async function (response) {
          try {
            // 2. Verify payment on our backend
            await api.post('/api/finance/verify-payment/', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              amount: amount
            });
            alert('Payment Successful! Wallet updated.');
            navigate('/finance/wallet');
          } catch (verifyError) {
            console.error("Verification failed:", verifyError);
            alert('Payment verification failed.');
          }
        },
        prefill: {
          name: "User",
          email: "user@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#d4af26"
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response){
        alert(response.error.description);
      });
      rzp1.open();
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Failed to initialize payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 space-y-5">
      {/* Header */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">🪙 Add Money to Wallet</h1>
        <p className="text-xs mt-0.5 text-[var(--color-text-secondary)]">Top up your wallet balance for seamless shipments</p>
      </div>

      <div className="bg-[var(--color-bg-surface)] rounded-lg p-6 border border-[var(--color-border)] max-w-2xl mx-auto space-y-6">
        
        <div>
          <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-3">Select predefined amount</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {predefinedAmounts.map(preset => (
              <button 
                key={preset}
                onClick={() => setAmount(preset.toString())}
                className={`py-3 rounded-md font-medium text-sm transition-all border ${
                  amount === preset.toString() 
                  ? 'border-[#d4af26] bg-[#d4af26]/10 text-[#d4af26]' 
                  : 'border-[var(--color-border)] hover:border-[#d4af26] text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                ₹{preset}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-px bg-[var(--color-border)] flex-1"></div>
          <span className="text-xs text-[var(--color-text-secondary)]">OR ENTER CUSTOM AMOUNT</span>
          <div className="h-px bg-[var(--color-border)] flex-1"></div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">Amount (₹)</label>
          <input 
            type="number" 
            placeholder="e.g. 5000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-transparent border border-[var(--color-border)] rounded-md px-4 py-3 text-lg font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-[#d4af26] transition-colors"
          />
        </div>

        <button 
          onClick={handlePayment}
          disabled={loading || !amount}
          className="w-full bg-[#d4af26] hover:bg-[#c39f19] text-white font-bold py-3.5 rounded-md transition-colors disabled:opacity-50"
        >
          {loading ? 'Processing...' : `Proceed to Pay ₹${amount || '0'}`}
        </button>

      </div>
    </div>
  );
};

export default AddMoney;
