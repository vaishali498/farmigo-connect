const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  userType: { type: String, required: true },
  category: { type: String, required: true },
  fullName: { type: String, required: true },
  mobile: { type: String, required: true },
  state: { type: String, required: true },
  district: { type: String, required: true },
  village: { type: String, required: true },
  plotNumber: { type: String },               // ✅ For Sellers
  aadhaarOrLicense: { type: String }           // ✅ For Buyers
});

const Farmer = mongoose.model('Farmer', farmerSchema);

module.exports = Farmer;
