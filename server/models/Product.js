const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    
    team: { type: String, required: true }, // e.g., "Lakers"
    price: { type: Number, required: true },
    image: { type: String, required: true }, // URL to image
    category: { type: String, default: true },
    description: { type: String },
    quantity:{ type: Number, default: 0 }, // New: Optional product description
    sizes: [{ type: String }],    // New: Array of available sizes (e.g., ['S', 'M', 'L', 'XL'])
    stock: { type: Number, required: true,default: 0 },
    
    reviews:[
        {
            username: { type: String, required: true },
            rating: { type: Number, required: true, min: 1, max: 5 },
            comment: { type: String }
        }
    ]
    
});

module.exports = mongoose.model('Product', ProductSchema);