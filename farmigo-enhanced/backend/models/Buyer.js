const mongoose = require('mongoose');

const buyerSchema = new mongoose.Schema({
    // name: { type: String, required: true },
    name: {
    first: String,
    middle: String,
    last: String
  },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true, unique: true },

     address: {
    // street: { type: String, required: true },
    // state: { type: String, required: true },
    // city: { type: String, required: true },
    // pinCode: { type: String, required: true },
    // country: { type: String, default: 'India' }
    street: String,
    state: String,
    city:String,
    pinCode:String,
    country: String
  },
    password: { type: String, required: true },
    licenceOrAadhaarNo: { type: String, required: true },

    
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Buyer', buyerSchema);

