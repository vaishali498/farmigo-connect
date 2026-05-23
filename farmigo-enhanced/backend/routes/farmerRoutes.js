const express = require('express');
const router = express.Router();
// const Farmer = require('./Farmer'); // your model
const Farmer = require('../models/Farmer');


const upload = require('../middlewares/upload');  // ✅ Add this
const Seller = require('../models/Seller'); // Make sure this is at the top if not already imported
const Product = require('../models/Product');

// router.get('/products', (req, res) => {
//     res.send('GET route for /products is working');
// });

// // Test Route
// router.get('/test', (req, res) => {
//     res.send('Test route is working');
//   });
  
// router.get('/check-session', (req, res) => {
//   console.log('Session Check:', req.session);
//   res.json(req.session);
// });

// POST route to add a farmer
router.post('/add', async (req, res) => {
    try {
        const farmer = new Farmer(req.body);
        await farmer.save();
        res.status(201).json({ message: 'Farmer registered successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});


// ✅ New route: List a product (with images)
router.post('/products', upload.array('photos', 5), async (req, res) => {
//     console.log('📥 Product Submission:', req.body);
//   console.log('👤 Seller Session ID:', req.session.sellerId);
    
    // console.log('Session Data:', req.session); 
    // console.log('Product POST route hit:', req.body);
//   console.log('SESSION:', req.session);  
    // console.log("✅ Received Body:", req.body);
    // console.log("✅ Session Data:", req.session);
    // console.log("✅ Uploaded Files:", req.files);

    try {

        if (!req.session.sellerId || req.session.role !== 'seller') {
            return res.status(403).json({ message: 'Unauthorized. Please login as seller.' });
        }

        console.log('BODY:', req.body);
        console.log('FILES:', req.files);

        // const { category, product, price, sellerName, mobile, address } = req.body;
        // const { category, product, price, sellerId } = req.body;
         const { category, product, price, minOrderQty} = req.body;

          const sellerId = req.session.sellerId;  // <-- extract sellerId here
               
           if (!category || !product || !price || !minOrderQty) {
        return res.status(400).json({ message: 'Please fill all required fields.' });
    }
        const photos = req.files.map(file => file.filename);

       // 🟢 Fetch seller details
        const seller = await Seller.findById(sellerId);
        if (!seller) {
            return res.status(404).json({ message: 'Seller not found.' });
        }
         
        // 👇 Flatten relevant seller info for product snapshot
    const sellerName = `${seller.name.first || ''} ${seller.name.middle || ''} ${seller.name.last || ''}`.trim();
    const fullAddress = `${seller.address.plotNo || ''}, ${seller.address.street || ''}, ${seller.address.city || ''}, ${seller.address.state || ''}, ${seller.address.pinCode || ''}, ${seller.address.country || 'India'}`.trim();

        const newProduct = new Product({
            category,
            product,
            price,
            minOrderQty,
            photos,
            sellerId,  // 🟢 Use session-stored seller ID
                 
            // You can optionally store these in the product schema
      sellerName,        // optional snapshot
      sellerMobile: seller.mobile,
      sellerAddress: fullAddress
        });
      
// await newProduct.save();
//   console.log("✅ Product saved to MongoDB", result);
const result = await newProduct.save();
console.log("✅ Product saved to MongoDB", result);


        // await newProduct.save();
        res.status(201).json({ message: 'Product listed successfully!' });
    } catch (error) {
        console.error('Error in /products:', error);
        res.status(500).json({ message: 'Failed to list product', error: error.message });
    }
});

// Modified route for fetching products
router.get('/products', async (req, res) => {
    const query = req.query.query?.toLowerCase() || '';  // Get the query parameter
    try {
        const products = await Product.find({
            $or: [
                { product: { $regex: query, $options: 'i' } }, // Case-insensitive search on product name
                { category: { $regex: query, $options: 'i' } }  // Case-insensitive search on category
            ]
        }).populate('sellerId', 'name address mobile'); // 👈 fetch only specific fields;
        // });
        res.json(products);  // Return the matching products
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Error fetching products' });  // Return an error message if something fails
    }
});





module.exports = router;

// router.get('/test', (req, res) => {
//     res.send('Test route is working');
//   });
  
