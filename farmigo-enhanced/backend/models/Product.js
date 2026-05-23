const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  category: { type: String, required: true },
  product: { type: String, required: true },
  price: { type: String, required: true },
  
  minOrderQty: { type: Number, required: true }, // 👈 new field

  // photos: [String], // Array of image filenames
 photos: { type: [String], default: [] }, // optional improvement

    sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  // 👇 Optional snapshot fields
  sellerName: { type: String },
  sellerMobile: { type: String },
  sellerAddress: { type: String }
  
},{ timestamps: true }); // adds createdAt and updatedAt

module.exports = mongoose.model('Product', productSchema);
