import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
const ngoSchema = new mongoose.Schema({
  ngoname: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirmpassword: {
    type: String,
    required: true,
  },
  NgoImage:{
    type: String,
    required: true,
  },
  refreshToken:{
    type:String
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  address: {
    type: String,
    required: true,
    unique: true,
  },
  logitude: {
    type: String,
    required: true,
  },
  latitude: {
    type: String,
    required: true,
  },
  discription: {
    type: String,
    required: true,
  },
  donations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donation",
    },
  ],
});

ngoSchema.pre("save", function () {
  this.confirmpassword = undefined;
});

ngoSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

ngoSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

ngoSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      ngoname: this.ngoname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
ngoSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const Ngo = mongoose.model("NGOS", ngoSchema);