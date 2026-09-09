const mongoose = require('mongoose'); 

const UserGoogle = new mongoose.Schema({ 
    googleId: { type: String, required: true, unique: true },
    displayName: { type: String, required: true }, 
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: false, unique: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: false },
    details: {
        address:  { type: String, required: false },
        city:     { type: String, required: false },
        province: { type: String, required: false },
        zipcode:  { type: String, required: false }
    },
    role: { type: String, require: true, default: "customer" },
}, { timestamps: true });

module.exports = mongoose.model('UserGoogle', UserGoogle); 