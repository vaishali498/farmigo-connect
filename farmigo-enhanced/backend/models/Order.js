const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Buyer', required: true },
  buyerName: { type: String },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  category: { type: String },
  quantity: { type: Number, required: true },
  price: { type: String },
  totalAmount: { type: Number },
  deliveryAddress: { type: String },
  status: {
    type: String,
    enum: ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Placed'
  },
  statusHistory: [{
    status: String,
    updatedAt: { type: Date, default: Date.now }
  }],
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
