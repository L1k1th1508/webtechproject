import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Shop from './components/Shop';
import Cart from './components/Cart';

function App() {
  const [cart, setCart] = useState([]);
  
  // 1. STATE: Track which category is clicked (Default: 'All')
  const [selectedCategory, setSelectedCategory] = useState('All');

  const addToCart = (product) => {
    setCart([...cart, product]);
    alert(`${product.team} jersey added to cart!`);
  };

  const removeFromCart = (indexToRemove) => {
    setCart(cart.filter((_, index) => index !== indexToRemove));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <Router>
      <div className="container mt-4">
        {/* NAVBAR */}
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4 rounded p-3 shadow">
          <div className="container-fluid">
            <Link className="navbar-brand fw-bold text-warning" to="/" onClick={() => setSelectedCategory('All')}>
              🏆 JerseyStore
            </Link>
            
            {/* 2. CATEGORY BUTTONS */}
            <div className="d-flex gap-2 ms-3">
              <button 
                className={`btn btn-sm ${selectedCategory === 'All' ? 'btn-light' : 'btn-outline-secondary text-white'}`}
                onClick={() => setSelectedCategory('All')}
              >
                All
              </button>
              <button 
                className={`btn btn-sm ${selectedCategory === 'Football' ? 'btn-light' : 'btn-outline-secondary text-white'}`}
                onClick={() => setSelectedCategory('Football')}
              >
                 Football
              </button>
              <button 
                className={`btn btn-sm ${selectedCategory === 'Basketball' ? 'btn-light' : 'btn-outline-secondary text-white'}`}
                onClick={() => setSelectedCategory('Basketball')}
              >
                 Basketball
              </button>
              <button 
                className={`btn btn-sm ${selectedCategory === 'Cricket' ? 'btn-light' : 'btn-outline-secondary text-white'}`}
                onClick={() => setSelectedCategory('Cricket')}
              >
                 Cricket
              </button>
            </div>

            <Link className="btn btn-warning fw-bold ms-auto" to="/cart">
              Cart ({cart.length})
            </Link>
          </div>
        </nav>

        <Routes>
          {/* 3. PASS THE CATEGORY TO SHOP */}
          <Route path="/" element={<Shop addToCart={addToCart} selectedCategory={selectedCategory} />} />
          <Route path="/cart" element={<Cart cart={cart} removeFromCart={removeFromCart} clearCart={clearCart} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;