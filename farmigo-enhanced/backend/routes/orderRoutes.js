const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Buyer = require('../models/Buyer');

// Place order
router.post('/place', async (req, res) => {
  try {
    if (!req.session.buyerId || req.session.role !== 'buyer') {
      return res.status(403).json({ message: 'Please login as buyer to place order.' });
    }
    const { productId, quantity, deliveryAddress } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    const buyer = await Buyer.findById(req.session.buyerId);
    const buyerName = buyer ? `${buyer.name.first || ''} ${buyer.name.last || ''}`.trim() : 'Buyer';
    const totalAmount = parseFloat(product.price) * parseInt(quantity) || 0;
    const order = new Order({
      buyerId: req.session.buyerId,
      buyerName,
      sellerId: product.sellerId,
      productId,
      productName: product.product,
      category: product.category,
      quantity: parseInt(quantity),
      price: product.price,
      totalAmount,
      deliveryAddress,
      statusHistory: [{ status: 'Placed' }]
    });
    await order.save();
    res.status(201).json({ message: 'Order placed successfully!', orderId: order._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Buyer: get my orders
router.get('/my-orders', async (req, res) => {
  try {
    if (!req.session.buyerId) return res.status(403).json({ message: 'Login required.' });
    const orders = await Order.find({ buyerId: req.session.buyerId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Seller: get orders for my products
router.get('/seller-orders', async (req, res) => {
  try {
    if (!req.session.sellerId) return res.status(403).json({ message: 'Login required.' });
    const orders = await Order.find({ sellerId: req.session.sellerId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Seller: update order status
router.put('/update-status/:orderId', async (req, res) => {
  try {
    if (!req.session.sellerId) return res.status(403).json({ message: 'Login required.' });
    const { status } = req.body;
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    order.status = status;
    order.statusHistory.push({ status });
    await order.save();
    res.json({ message: 'Status updated!', order });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Seller: dashboard stats
router.get('/dashboard-stats', async (req, res) => {
  try {
    if (!req.session.sellerId) return res.status(403).json({ message: 'Login required.' });
    const orders = await Order.find({ sellerId: req.session.sellerId });
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const delivered = orders.filter(o => o.status === 'Delivered').length;
    const pending = orders.filter(o => !['Delivered','Cancelled'].includes(o.status)).length;
    // Category breakdown
    const catMap = {};
    orders.forEach(o => { catMap[o.category] = (catMap[o.category] || 0) + 1; });
    const categoryStats = Object.entries(catMap).map(([cat, count]) => ({ cat, count }));
    res.json({ totalOrders, totalRevenue, delivered, pending, categoryStats });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
