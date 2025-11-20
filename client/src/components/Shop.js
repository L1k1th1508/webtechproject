import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductCard = ({ product, addToCart, refreshData }) => {
  const sizes = product.sizes || [];
  const reviews = product.reviews || [];
  
  // Default to the first size
  const [selectedSize, setSelectedSize] = useState(sizes.length > 0 ? sizes[0] : '');
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ user: '', rating: 5, comment: '' });

  // --- NEW LOGIC: GET STOCK FOR THE CURRENTLY SELECTED SIZE ---
  // If product.stock is an object { S: 10, M: 0 }, we grab the value for selectedSize
  const currentSizeStock = product.stock ? product.stock[selectedSize] : 0;

  // Limit the Quantity dropdown based on current size stock (Max 10)
  const maxQty = Math.min(currentSizeStock, 10);
  const qtyOptions = [...Array(maxQty).keys()].map(i => i + 1);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
    : "New";

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/products/${product._id}/review`, reviewForm);
      setReviewForm({ user: '', rating: 5, comment: '' });
      refreshData();
    } catch (error) { console.error(error); }
  };

  const handleAddToCart = () => {
    addToCart({ ...product, selectedSize, quantity: parseInt(quantity) });
  };

  return (
    <div className="col-md-4 mb-4">
      <div className="card h-100">
        <div className="p-3">
          <img src={product.image} className="card-img-top" alt={product.name} style={{height: '220px', objectFit: 'contain'}} />
          
          <div className="d-flex justify-content-between align-items-start mt-3">
            <h5 className="card-title mb-0">{product.name}</h5>
            <span className="badge bg-warning text-dark">⭐ {avgRating}</span>
          </div>
          <p className="card-text text-muted small mt-1 mb-1">{product.team}</p>
          <h5 className="text-primary fw-bold mb-3">₹{product.price}</h5>

          {/* --- DROPDOWNS --- */}
          <div className="row mb-3">
            <div className="col-6">
              <label className="form-label small text-muted">Size</label>
              <select 
                className="form-select form-select-sm" 
                value={selectedSize} 
                onChange={(e) => {
                    setSelectedSize(e.target.value);
                    setQuantity(1); // Reset qty when size changes
                }}
              >
                {sizes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-6">
              <label className="form-label small text-muted">Qty</label>
              <select 
                className="form-select form-select-sm" 
                value={quantity} 
                onChange={(e) => setQuantity(e.target.value)} 
                disabled={currentSizeStock === 0}
              >
                {qtyOptions.length > 0 ? (
                    qtyOptions.map(num => <option key={num} value={num}>{num}</option>)
                ) : (
                    <option>0</option>
                )}
              </select>
            </div>
          </div>

          {/* --- DYNAMIC MESSAGES BASED ON SELECTED SIZE --- */}
          
          {/* Case 1: Out of Stock (0) */}
          {currentSizeStock === 0 && (
             <div className="alert alert-danger py-2 px-2 text-center mb-3">
               <small className="fw-bold">🚫 Size {selectedSize} is Out of Stock</small>
             </div>
          )}

          {/* Case 2: Low Stock (1 to 5) */}
          {currentSizeStock > 0 && currentSizeStock <= 5 && (
            <div className="alert alert-warning py-2 px-2 text-center mb-3 shadow-sm" style={{backgroundColor: '#fff3cd', border: '1px solid #ffeeba'}}>
               <div className="fw-bold text-dark" style={{fontSize: '0.85rem'}}>
                 🔥 Hurry! Only {currentSizeStock} left in {selectedSize}
               </div>
            </div>
          )}
          
          {/* Case 3: Good Stock (More than 5) */}
          {currentSizeStock > 5 && (
            <div className="alert alert-success py-2 px-2 text-center mb-3">
               <small className="fw-bold">✅ In Stock</small>
            </div>
          )}

          <button 
            className="btn btn-primary w-100 mb-2" 
            onClick={handleAddToCart} 
            disabled={currentSizeStock === 0}
          >
            {currentSizeStock === 0 ? 'Sold Out' : 'Add to Cart'}
          </button>
        </div>

        {/* REVIEWS SECTION */}
        <div className="card-footer border-top p-3" style={{backgroundColor: '#e3f2fd'}}>
          <h6 className="fw-bold text-dark mb-2" style={{fontSize: '0.9rem'}}>Reviews ({reviews.length})</h6>
          <div className="mb-3 pe-1" style={{maxHeight: '120px', overflowY: 'auto', backgroundColor: 'white', borderRadius: '5px', border: '1px solid #bbdefb'}}>
            {reviews.length === 0 ? <p className="text-muted small p-2 m-0">No reviews yet.</p> : (
              <ol className="list-group list-group-numbered list-group-flush m-0">
                {reviews.map((rev, idx) => (
                  <li key={idx} className="list-group-item d-flex justify-content-between align-items-start p-2">
                    <div className="ms-2 me-auto" style={{lineHeight: '1.2'}}>
                      <div className="fw-bold text-dark" style={{fontSize: '0.8rem'}}>{rev.user || 'Guest'}</div>
                      <small className="text-secondary">{rev.comment}</small>
                    </div>
                    <span className="badge bg-warning text-dark rounded-pill" style={{fontSize: '0.7rem'}}>{rev.rating} ★</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
          <form onSubmit={submitReview}>
            <div className="input-group input-group-sm mb-1">
              <input type="text" className="form-control" placeholder="Name" value={reviewForm.user} onChange={e => setReviewForm({...reviewForm, user: e.target.value})} required />
              <select className="form-select" style={{maxWidth: '100px'}} value={reviewForm.rating} onChange={e => setReviewForm({...reviewForm, rating: parseInt(e.target.value)})}>
                <option value="5">5</option><option value="4">4</option><option value="3">3</option><option value="2">2</option><option value="1">1</option>
              </select>
            </div>
            <div className="input-group input-group-sm">
              <input type="text" className="form-control" placeholder="Review..." value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} required />
              <button className="btn btn-dark" type="submit">➤</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Shop = ({ addToCart, selectedCategory }) => {
  const [products, setProducts] = useState([]);

  const fetchProducts = () => {
    axios.get('http://localhost:5000/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.log(err));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  return (
    <div>
      <h2 className="mb-4 text-white">{selectedCategory} Jerseys</h2>
      <div className="row">
        {filteredProducts.length === 0 ? (
           <div className="text-white">No products found. (Did you reset the DB?)</div>
        ) : (
           filteredProducts.map(product => (
             <ProductCard key={product._id} product={product} addToCart={addToCart} refreshData={fetchProducts} />
           ))
        )}
      </div>
    </div>
  );
};

export default Shop;