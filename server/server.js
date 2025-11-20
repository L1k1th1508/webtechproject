require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cors());

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/jerseyStore', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// --- SCHEMAS ---

// 1. PRODUCT SCHEMA
const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    team: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    description: { type: String },
    sizes: [{ type: String }],
    stock: {
        S: { type: Number, default: 0 },
        M: { type: Number, default: 0 },
        L: { type: Number, default: 0 },
        XL: { type: Number, default: 0 },
        XXL: { type: Number, default: 0 }
    }, 
    category: { type: String, required: true },           
    reviews: [
        {
            user: { type: String },
            rating: { type: Number },
            comment: { type: String }
        }
    ]
});
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

// 2. ORDER SCHEMA
const OrderSchema = new mongoose.Schema({
    orderId: String,
    customer: { name: String, address: String, city: String, zip: String },
    items: [
        {
            productId: String,
            name: String,
            quantity: Number,
            size: String,
            price: Number
        }
    ],
    // Financials
    subtotal: Number,
    tax: Number,
    discount: Number,
    totalAmount: Number, // This is where the Grand Total is stored
    
    paymentMethod: { type: String, required: true },
    paymentStatus: { type: String, default: 'Paid' },
    date: { type: Date, default: Date.now }
});
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

// --- ROUTES ---

app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/seed', async (req, res) => {
    try {
        await Product.deleteMany({});
        const seedProducts = [
            // FOOTBALL
            { name: "Manchester City Home 23/24", team: "Man City FC", price: 1999, image: "/images/mancity.png", sizes: ["S","M","L","XL"], stock: { S: 5, M: 0, L: 20, XL: 20 }, description: "Official Manchester City Home Jersey.", category: "Football", reviews: [] },
            { name: "Real Madrid", team: "Real Madrid FC", price: 2499, image: "/images/realmadrid.png", sizes: ["S","M","L","XL"], stock: { S: 10, M: 10, L: 10, XL: 10 }, description: "Official Real Madrid Jersey.", category: "Football", reviews: [] },
            { name: "FC Barcelona Home", team: "FC Barcelona", price: 2299, image: "/images/barcelona.png", sizes: ["S","M","L","XL"], stock: { S: 10, M: 10, L: 10, XL: 10 }, description: "Official FC Barcelona Home Kit.", category: "Football", reviews: [] },
            { name: "Liverpool FC", team: "Liverpool FC", price: 1499, image: "/images/Liverpool.png", sizes: ["S","M","L","XL"], stock: { S: 10, M: 10, L: 10, XL: 10 }, description: "Official Liverpool FC Jersey.", category: "Football", reviews: [] },
            
            { name: "Argentina", team: "Argentina FC", price: 1999, image: "/images/ARGENTINA.png", sizes: ["S","M","L","XL"], stock: { S: 10, M: 10, L: 10, XL: 10 }, description: "Official Argentina Home Jersey.", category: "Football", reviews: [] },
            { name: "Brazil", team: "Brazil FC", price: 1999, image: "/images/BRAZIL.png", sizes: ["S","M","L","XL"], stock: { S: 10, M: 10, L: 10, XL: 10 }, description: "Official Brazil Jersey.", category: "Football", reviews: [] },
            { name: "Spurs", team: "Spurs FC", price: 1999, image: "/images/spurs.png", sizes: ["S","M","L","XL"], stock: { S: 10, M: 10, L: 10, XL: 10 }, description: "Official Spurs Home Jersey.", category: "Football", reviews: [] },

            // BASKETBALL
            { name: "Lakers Icon Edition", team: "Lakers", price: 2999, image: "/images/Lakersicon.png", sizes: ["S","M","L","XL"], stock: { S: 2, M: 20, L: 20, XL: 20 }, description: "Icon Edition Lakers Jersey.", category: "Basketball", reviews: [] },
            { name: "Miami Heat City Edition", team: "Miami Heat", price: 2299, image: "/images/miami.png", sizes: ["S","M","L","XXL"], stock: { S: 5, M: 5, L: 0, XL: 5, XXL: 5 }, description: "Miami Heat City Edition Jersey.", category: "Basketball", reviews: [] },
            { name: "Chicago Bulls", team: "Chicago Bulls", price: 1999, image: "/images/Chicago.png", sizes: ["S","M","L","XL"], stock: { S: 10, M: 10, L: 10, XL: 10 }, description: "Official Chicago Bulls Jersey.", category: "Basketball", reviews: [] },
            { name: "Golden State Warriors", team: "Golden State Warriors", price: 2999, image: "/images/warriors.png", sizes: ["S","M","L","XL"], stock: { S: 10, M: 10, L: 10, XL: 10 }, description: "Official GSW Jersey.", category: "Basketball", reviews: [] },
            { name: "Boston Celtics", team: "Boston Celtics", price: 2499, image: "/images/Celtics.png", sizes: ["S","M","L","XL"], stock: { S: 10, M: 10, L: 10, XL: 10 }, description: "Official Boston Celtics Jersey.", category: "Basketball", reviews: [] },

            // CRICKET
            { name: "Delhi Capitals", team: "Delhi Capitals", price: 1499, image: "/images/DC.png", sizes: ["S","M","L","XL"], stock: { S: 10, M: 10, L: 10, XL: 10 }, description: "Official Delhi Capitals Jersey.", category: "Cricket", reviews: [] },
            { name: "India", team: "India FC", price: 1499, image: "/images/INDIANFB.png", sizes: ["S","M","L","XL"], stock: { S: 20, M: 20, L: 20, XL: 20 }, description: "Official India Jersey.", category: "Football", reviews: [] },
            { name: "Kolkata Knight Riders", team: "Kolkata Knight Riders", price: 1499, image: "/images/KKR.png", sizes: ["S","M","L","XL"], stock: { S: 10, M: 10, L: 10, XL: 10 }, description: "Official KKR Jersey.", category: "Cricket", reviews: [] },
            { name: "Mumbai Indians", team: "Mumbai Indians", price: 1499, image: "/images/MI.png", sizes: ["S","M","L","XL"], stock: { S: 10, M: 10, L: 10, XL: 10 }, description: "Official Mumbai Indians Jersey.", category: "Cricket", reviews: [] },
            { name: "Royal Challengers Bangalore", team: "Royal Challengers Bangalore", price: 1499, image: "/images/RCB.png", sizes: ["S","M","L","XL"], stock: { S: 10, M: 10, L: 10, XL: 10 }, description: "Official RCB Jersey.", category: "Cricket", reviews: [] },
            { name: "SunRisers Hyderabad", team: "SunRisers Hyderabad", price: 1299, image: "/images/SRH.png", sizes: ["S","M","L","XL"], stock: { S: 10, M: 10, L: 10, XL: 10 }, description: "Official SRH Jersey.", category: "Cricket", reviews: [] },
            { name: "Chennai Super Kings", team: "Chennai Super Kings", price: 1599, image: "/images/CSK.png", sizes: ["S","M","L","XL"], stock: { S: 10, M: 10, L: 10, XL: 10 }, description: "Official CSK Jersey.", category: "Cricket", reviews: [] },
            { name: "Indian Cricket Team", team: "Indian Cricket Team", price: 1999, image: "/images/indiancricket.png", sizes: ["S","M","L","XL"], stock: { S: 5, M: 0, L: 5, XL: 5 }, description: "Official Indian Cricket T20 Team Jersey.", category: "Cricket", reviews: [] }
        ];

        await Product.insertMany(seedProducts);
        res.json({ message: "Database reset and seeded!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/products/:id/review', async (req, res) => {
    try {
        const { user, rating, comment } = req.body;
        const product = await Product.findById(req.params.id);
        if (product) {
            product.reviews.push({ user, rating, comment });
            await product.save();
            res.json(product); 
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- CHECKOUT ROUTE (UPDATED TO MATCH FRONTEND) ---
app.post('/api/checkout', async (req, res) => {
    // We now destruct 'totalAmount' instead of 'total'
    const { cart, shipping, paymentMethod, subtotal, tax, discount, totalAmount } = req.body;

    try {
        // 1. VALIDATE STOCK
        for (const item of cart) {
            const product = await Product.findById(item._id);
            if (!product) return res.status(404).json({ message: `Product not found` });
            
            const sizeStock = product.stock[item.selectedSize];
            if (sizeStock < item.quantity) {
                return res.status(400).json({ message: `Stock Error: Only ${sizeStock} left for ${item.name} (${item.selectedSize})` });
            }
        }

        // 2. DEDUCT STOCK
        for (const item of cart) {
            const product = await Product.findById(item._id);
            product.stock[item.selectedSize] -= item.quantity;
            product.markModified('stock');
            await product.save();
        }

        // 3. SAVE ORDER
        const generatedOrderId = "ORD-" + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100);

        const newOrder = new Order({
            orderId: generatedOrderId,
            customer: shipping,
            items: cart.map(item => ({
                productId: item._id,
                name: item.name,
                quantity: item.quantity,
                size: item.selectedSize,
                price: item.price
            })),
            // Financials
            subtotal: subtotal,
            tax: tax,
            discount: discount,
            
            // --- KEY CHANGE: MAPPING totalAmount ---
            totalAmount: totalAmount, 
            
            paymentMethod: paymentMethod
        });
        
        const savedOrder = await newOrder.save();
        res.json({ message: "Order successful!", order: savedOrder });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error processing order" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));