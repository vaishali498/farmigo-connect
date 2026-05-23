const express = require('express');
const router = express.Router();
const Seller = require('../models/Seller');
const Buyer = require('../models/Buyer');
const bcrypt = require('bcryptjs');

// Register Route
router.post('/register', async (req, res) => {
    try {
        // const { role, name, email, mobile, password, plotNo, licenceOrAadhaarNo } = req.body;
        const { role, name, email, mobile, address, password, plotNo, licenceOrAadhaarNo } = req.body;
        

        // Check required fields
        if (!role || !name || !email || !password) {
            return res.status(400).json({ message: 'Please fill all required fields.' });
        }


        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        if (role === 'seller') {
            
            if (!plotNo) {
                return res.status(400).json({ message: 'Plot number is required for sellers.' });
            }

            // Check if seller already exists
            const existingSeller = await Seller.findOne({ email });
            if (existingSeller) {
                return res.status(400).json({ message: 'Seller with this email already exists.' });
            }

            const newSeller = new Seller({
                name,
                email,
                mobile,
                address,
                password: hashedPassword,
                plotNo
            });
            await newSeller.save();
            return res.status(201).json({ message: 'Seller registered successfully!' });
         
                


        } else if (role === 'buyer') {
           
            if (!licenceOrAadhaarNo) {
                return res.status(400).json({ message: 'Licence number or Aadhaar number is required for buyers.' });
            }

            // Check if buyer already exists
            const existingBuyer = await Buyer.findOne({ email });
            if (existingBuyer) {
                return res.status(400).json({ message: 'Buyer with this email already exists.' });
            }

            const newBuyer = new Buyer({
                name,
                email,
                mobile,
                address,
                password: hashedPassword,
                licenceOrAadhaarNo
            });
            await newBuyer.save();
            return res.status(201).json({ message: 'Buyer registered successfully!' });

        } else {
            return res.status(400).json({ message: 'Invalid role selected.' });
        }

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error. Please try again.' });
    }
});

// module.exports = router;

// Login Route
// Login Route
router.post('/login', async (req, res) => {
    try {
        const { role, emailOrMobile, password } = req.body;

        if (!role || !emailOrMobile || !password) {
            return res.status(400).json({ message: 'Please fill all required fields.' });
        }

        let user;
        if (role === 'seller') {
            // req.session.sellerId = seller._id; // ✅ Store seller ID in session
            user = await Seller.findOne({
                $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }]
            });
    //         if (user) {
    //     req.session.sellerId = user._id; // ✅ Now it's defined
    //     req.session.role = 'seller';
    //   }
      
//  if (user) {
//         req.session.sellerId = user._id;
//         req.session.role = 'seller';
//         console.log('Session after login:', req.session);  // <---- here
//     }


        } else if (role === 'buyer') {
            //  req.session.buyerId = user._id;  // Optional: if you want to track buyer too
            user = await Buyer.findOne({
                $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }]
            });

    //           if (user) {
    //     req.session.buyerId = user._id;
    //     req.session.role = 'buyer';
    //   }

        } else {
            return res.status(400).json({ message: 'Invalid role selected.' });
        }

        if (!user) {
            return res.status(400).json({ message: 'User not found.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // console.log('📦 Session Before Saving:', req.session);
        //  console.log('Session after login:', req.session);

             if (role === 'seller') {
      req.session.sellerId = user._id;
      req.session.role = 'seller';
    } else {
      req.session.buyerId = user._id;
      req.session.role = 'buyer';
    }
    // console.log('✅ Session after login:', req.session);

        // Successful login
        return res.status(200).json({ 
            message: 'Login successful!', 
            user: { name: user.name, email: user.email || '', mobile: user.mobile || '', role }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error. Please try again.' });
    }
});


// ----------------------------
// Check Seller Session
// ----------------------------

router.get('/seller/check-session', (req, res) => {
  if (req.session.sellerId && req.session.role === 'seller') {
    return res.json({ loggedIn: true });
    
    
  }
  res.status(401).json({ loggedIn: false });
});


//logout route

// router.get('/logout', (req, res) => {
//   req.session.destroy(err => {
//     if (err) return res.status(500).json({ message: 'Logout failed' });
//     res.clearCookie('connect.sid');
//     return res.status(200).json({ message: 'Logged out successfully' });
//   });
// });


module.exports = router;




// Buyer session check
router.get('/buyer/check-session', (req, res) => {
  if (req.session.buyerId && req.session.role === 'buyer') {
    return res.json({ loggedIn: true });
  }
  res.status(401).json({ loggedIn: false });
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.clearCookie('connect.sid');
    return res.status(200).json({ message: 'Logged out successfully' });
  });
});
