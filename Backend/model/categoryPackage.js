const mongoose = require("mongoose")

const categoryPackage = new mongoose.Schema({
    categoryName:{
        type: String,
        required: true
    }
})

module.exports = mongoose.model('categoryPackage', categoryPackage);