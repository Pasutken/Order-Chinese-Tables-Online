const mongoose = require("mongoose");

const PackageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  maxprice: {
    type: Number,
    required: true,
  },
  minprice: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  dishes: [
    {
      group: [
        {
          menuItem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MenuItem",
            required: false,
          },
        },
      ],
    },
  ],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "categoryName",
    required: false,
  }
});
PackageSchema.index({ price: 1 });
module.exports = mongoose.model("Package", PackageSchema, "Packages");
