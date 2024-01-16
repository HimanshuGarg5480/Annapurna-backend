const mongoose = require("mongoose");
const donationSchema = new mongoose.Schema({
  organizationName: {
    type: String,
    unique: true,
  },
  date: String,
  image: String,
  donatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  donatedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ngo",
  }
});

export const Donation = mongoose.model("Donation", donationSchema);

