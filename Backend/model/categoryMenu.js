const mongoose = require("mongoose")

const categoryMenu = new mongoose.Schema({
    categoryMenu:{
        type: String,
        required: true
    }
})

module.exports = mongoose.model('categoryMenu', categoryMenu);