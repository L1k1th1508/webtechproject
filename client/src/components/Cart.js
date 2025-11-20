import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Cart = ({ cart, removeFromCart, clearCart }) => {
  const [step, setStep] = useState('cart');
  const [shipping, setShipping] = useState({ name: '', address: '', city: '', Pincode: '' });
  const [paymentMethod, setPaymentMethod] = useState('Credit Card'); 
  const [finalOrder, setFinalOrder] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- DISCOUNT STATE ---
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');

  // --- 1. CALCULATIONS (Defined at the top so they are available everywhere) ---
  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
  
  // Calculate Financials for Display
  const displaySubtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const displayDiscount = Math.round((displaySubtotal * discountPercent) / 100);
  const displayTax = Math.round((displaySubtotal - displayDiscount) * 0.18); 
  const displayTotal = (displaySubtotal - displayDiscount) + displayTax;

  // --- 2. HELPER FUNCTIONS ---
  
  // Coupon Logic
  const applyCoupon = (code, percent) => {
    setPromoCode(code);
    setDiscountPercent(percent);
    setPromoMessage(`✅ Applied! ${percent}% OFF with ${code}`);
  };

  const checkManualCode = () => {
    if (promoCode.toUpperCase() === 'BULK50' && totalQuantity > 10) {
        applyCoupon('BULK50', 50);
    } else if (promoCode.toUpperCase() === 'SQUAD30' && totalQuantity > 5) {
        applyCoupon('SQUAD30', 30);
    } else if (promoCode.toUpperCase() === 'WELCOME10') {
        applyCoupon('WELCOME10', 10);
    } else {
        setDiscountPercent(0);
        setPromoMessage('❌ Invalid Code or Requirement not met');
    }
  };

  const handleInputChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  // Submit Order Logic
  const handlePaymentSubmit = async () => {
    setIsProcessing(true);
    
    // Recalculate strictly for sending to backend
    const finalSubtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const finalDiscount = Math.round((finalSubtotal * discountPercent) / 100);
    const finalTax = Math.round((finalSubtotal - finalDiscount) * 0.12);
    const finalTotalAmount = (finalSubtotal - finalDiscount) + finalTax;

    try {
      const response = await axios.post('http://localhost:5000/api/checkout', {
        cart,
        shipping: { name: shipping.name, address: shipping.address, city: shipping.city, zip: shipping.Pincode },
        paymentMethod,
        
        // Sending Financials
        subtotal: finalSubtotal,
        tax: finalTax,
        discount: finalDiscount,
        totalAmount: finalTotalAmount // Matches Backend variable
      });

      setFinalOrder(response.data.order);
      setStep('invoice');
      clearCart();
    } catch (error) {
      alert("Order Failed: " + (error.response?.data?.message || "Server Error"));
    } finally {
      setIsProcessing(false);
    }
  };

  // --- 3. PRICE SUMMARY COMPONENT (Uses the variables defined above) ---
  const PriceSummary = () => (
    <div className="mt-3 border-top pt-3">
        <div className="d-flex justify-content-between mb-1 text-muted">
            <span>Subtotal ({totalQuantity} items):</span> <span>₹{displaySubtotal}</span>
        </div>
        {displayDiscount > 0 && (
            <div className="d-flex justify-content-between mb-1 text-success fw-bold">
                <span>Discount ({discountPercent}%):</span> <span>-₹{displayDiscount}</span>
            </div>
        )}
        <div className="d-flex justify-content-between mb-2 text-muted">
            <span>Tax (12% GST):</span> <span>+₹{displayTax}</span>
        </div>
        <div className="d-flex justify-content-between align-items-center border-top pt-3 mt-2">
            <span className="h5 fw-bold text-dark">Grand Total:</span> 
            <span className="h3 fw-bold text-primary">₹{displayTotal}</span>
        </div>
    </div>
  );

  // --- 4. RENDER STEPS ---

  // STEP 1: CART
  if (step === 'cart') {
    return (
      <div className="container">
        <h2 className="mb-4 text-white">Your Cart</h2>
        {cart.length === 0 ? (
          <div className="alert alert-secondary text-center p-5">
            <h4>Your cart is empty 😔</h4>
            <Link to="/" className="btn btn-primary mt-3">Go Shopping</Link>
          </div>
        ) : (
          <>
            <div className="list-group mb-3 shadow">
              {cart.map((item, index) => (
                <div key={index} className="list-group-item d-flex justify-content-between align-items-center bg-white border">
                  <div>
                      <h5 className="mb-1 text-dark">{item.name}</h5>
                      <div className="d-flex gap-3 text-muted small">
                        <span className="badge bg-secondary">{item.selectedSize}</span>
                        <span className="badge bg-warning text-dark">Qty: {item.quantity}</span>
                      </div>
                  </div>
                  <div className="text-end">
                      <div className="fw-bold text-primary fs-5">₹{item.price * item.quantity}</div>
                      <button className="btn btn-outline-danger btn-sm mt-1" onClick={() => removeFromCart(index)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="card p-4 bg-white shadow border-0">
              <h5 className="fw-bold text-dark">Available Coupons</h5>
              <div className="d-flex gap-2 mb-3 flex-wrap">
                <button 
                    className={`btn btn-sm ${totalQuantity > 10 ? 'btn-outline-success' : 'btn-light text-muted border'}`}
                    onClick={() => totalQuantity > 10 ? applyCoupon('BULK50', 50) : alert("Add more items to unlock 50% off!")}
                    disabled={totalQuantity <= 10}
                >
                    🏷️ <strong>BULK50</strong> (50% OFF)
                </button>

                <button 
                    className={`btn btn-sm ${totalQuantity > 5 ? 'btn-outline-primary' : 'btn-light text-muted border'}`}
                    onClick={() => totalQuantity > 5 ? applyCoupon('SQUAD30', 30) : alert("Add more items to unlock 30% off!")}
                    disabled={totalQuantity <= 5}
                >
                    🏷️ <strong>SQUAD30</strong> (30% OFF)
                </button>

                <button className="btn btn-sm btn-outline-secondary" onClick={() => applyCoupon('WELCOME10', 10)}>
                    🏷️ <strong>WELCOME10</strong> (10% OFF)
                </button>
              </div>

              <div className="input-group mb-2">
                  <input type="text" className="form-control" placeholder="Enter Code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
                  <button className="btn btn-dark" onClick={checkManualCode}>Apply</button>
              </div>
              {promoMessage && <div className="alert alert-info py-1 small">{promoMessage}</div>}

              <PriceSummary />
              <button className="btn btn-success btn-lg w-100 fw-bold mt-3" onClick={() => setStep('shipping')}>Proceed to Checkout 🚚</button>
            </div>
          </>
        )}
      </div>
    );
  }

  // STEP 2: SHIPPING
  if (step === 'shipping') {
    return (
      <div className="container" style={{maxWidth: '600px'}}>
        <h2 className="mb-4 text-white">Shipping Details</h2>
        <div className="card p-4 bg-white shadow">
          <form onSubmit={(e) => { e.preventDefault(); setStep('payment'); }}>
            <div className="mb-3"><label className="form-label text-dark fw-bold">Full Name</label><input type="text" name="name" className="form-control" required onChange={handleInputChange} placeholder="Name" /></div>
            <div className="mb-3"><label className="form-label text-dark fw-bold">Address</label><input type="text" name="address" className="form-control" required onChange={handleInputChange} placeholder="Address" /></div>
            <div className="row">
              <div className="col-6 mb-3"><label className="form-label text-dark fw-bold">City</label><input type="text" name="city" className="form-control" required onChange={handleInputChange} placeholder="City" /></div>
              <div className="col-6 mb-3"><label className="form-label text-dark fw-bold">Pin Code</label><input type="text" name="Pincode" className="form-control" required onChange={handleInputChange} placeholder="000000" /></div>
            </div>
            <PriceSummary />
            <div className="d-flex gap-2 mt-3">
                <button type="button" className="btn btn-outline-secondary w-50" onClick={() => setStep('cart')}>Back</button>
                <button type="submit" className="btn btn-primary w-50 fw-bold">Next: Payment</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // STEP 3: PAYMENT
  if (step === 'payment') {
    return (
      <div className="container" style={{maxWidth: '600px'}}>
        <h2 className="mb-4 text-white">Select Payment Method</h2>
        <div className="card p-4 bg-white shadow">
          <div className="mb-3">
            <div className={`card p-3 mb-2 border ${paymentMethod === 'UPI' ? 'border-primary bg-light' : ''}`} onClick={() => setPaymentMethod('UPI')} style={{cursor: 'pointer'}}>
              <h6 className="mb-0 fw-bold text-dark">📱 UPI (GPay/PhonePe)</h6>
            </div>
            <div className={`card p-3 mb-2 border ${paymentMethod === 'Credit Card' ? 'border-primary bg-light' : ''}`} onClick={() => setPaymentMethod('Credit Card')} style={{cursor: 'pointer'}}>
              <h6 className="mb-0 fw-bold text-dark">💳 Credit / Debit Card</h6>
            </div>
            <div className={`card p-3 mb-2 border ${paymentMethod === 'Cash on Delivery' ? 'border-primary bg-light' : ''}`} onClick={() => setPaymentMethod('Cash on Delivery')} style={{cursor: 'pointer'}}>
              <h6 className="mb-0 fw-bold text-dark">💵 Cash on Delivery</h6>
            </div>
          </div>
          <PriceSummary />
          <div className="d-flex gap-2 mt-3">
              <button className="btn btn-outline-secondary w-50" onClick={() => setStep('shipping')}>Back</button>
              <button className="btn btn-success w-50 fw-bold" onClick={handlePaymentSubmit} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : `Pay ₹${displayTotal}`}
              </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 4: INVOICE
  if (step === 'invoice' && finalOrder) {
    return (
      <div className="container" style={{maxWidth: '800px'}}>
        <div className="alert alert-success text-center shadow-sm"><h4 className="mb-0">🎉 Order Successful!</h4></div>
        <div className="card bg-white p-4 shadow border-0">
          <div className="border-bottom pb-3 mb-3">
            <div className="d-flex justify-content-between align-items-center">
                <div>
                    <h3 className="text-dark fw-bold">TAX INVOICE</h3>
                    <div className="text-muted small">Order ID: <span className="fw-bold text-primary">{finalOrder.orderId}</span></div>
                </div>
                <div className="text-end">
                    <div className="badge bg-success p-2 mb-1" style={{fontSize: '0.9rem'}}>PAID via {finalOrder.paymentMethod}</div>
                    <div className="text-muted small">{new Date(finalOrder.date).toLocaleString()}</div>
                </div>
            </div>
          </div>

          <div className="mb-4 p-3 bg-light rounded border">
            <h6 className="text-uppercase text-secondary fw-bold mb-1" style={{fontSize: '0.8rem'}}>Billed To:</h6>
            <strong className="text-dark fs-5">{finalOrder.customer.name}</strong> <br/>
            <span className="text-muted">{finalOrder.customer.address}, {finalOrder.customer.city} - {finalOrder.customer.zip}</span>
          </div>

          <table className="table table-bordered border-light">
            <thead className="table-light">
                <tr><th>Item</th><th>Qty</th><th className="text-end">Price</th></tr>
            </thead>
            <tbody>
                {finalOrder.items.map((item, idx) => (
                    <tr key={idx}>
                        <td>
                            <span className="fw-bold text-dark">{item.name}</span> <br/>
                            <small className="text-muted">Size: {item.size}</small>
                        </td>
                        <td>{item.quantity}</td>
                        <td className="text-end">₹{item.price * item.quantity}</td>
                    </tr>
                ))}
            </tbody>
          </table>

          <div className="row justify-content-end">
            <div className="col-lg-6 col-md-8">
                <div className="border-top pt-2">
                    <div className="d-flex justify-content-between mb-1 text-muted">
                        <span>Subtotal:</span> <span>₹{finalOrder.subtotal || 0}</span>
                    </div>
                    {finalOrder.discount > 0 && (
                        <div className="d-flex justify-content-between mb-1 text-success">
                            <span>Discount:</span> <span>-₹{finalOrder.discount}</span>
                        </div>
                    )}
                    <div className="d-flex justify-content-between mb-2 text-muted">
                        <span>Tax (12%):</span> <span>+₹{finalOrder.tax || 0}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded border">
                        <span className="fw-bold text-dark h5 mb-0">Grand Total:</span>
                        <span className="h4 fw-bold text-primary mb-0">₹{finalOrder.totalAmount || 0}</span>
                    </div>
                </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="btn btn-dark w-100 py-2 fw-bold">Return to Home</Link>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default Cart;