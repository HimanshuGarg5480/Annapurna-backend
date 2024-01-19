import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Ngo } from "../models/Ngos.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async function (user_id) {
  try {
    const ngo = await Ngo.findById(user_id);
    const accessToken = ngo.generateAccessToken();
    const refreshToken = ngo.generateRefreshToken();
    ngo.refreshToken = refreshToken;
    await ngo.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error)
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token"
    );
  }
};
// Create a new user
const ngoSignUp = asyncHandler(async (req, res) => {
  
  const {
    ngoname,
    email,
    password,
    confirmpassword,
    phone,
    address,
    logitude,
    latitude,
    discription,
  } = req.body;
  if (
    [
      email,
      ngoname,
      password,
      confirmpassword,
      phone,
      address,
      logitude,
      latitude,
      discription,
    ].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  if (password !== confirmpassword) {
    throw new ApiError(409, "password and confirm-password are not same");
  }
  const existedNgo = await Ngo.findOne({
    email: email,
  });

  if (existedNgo) {
    throw new ApiError(409, "Ngo with email already exists");
  }

  const ngoImageOrLogo = req.files?.NgoImage[0]?.path;
  
  if (!ngoImageOrLogo) {
    throw new ApiError(400, "Ngo Image or Logo file is required");
  }

  const ngoImage = await uploadOnCloudinary(ngoImageOrLogo);
  if (!ngoImage) {
    throw new ApiError(400, "Ngo Image file is required");
  }
  const ngo = await Ngo.create({
    NgoImage:ngoImage.url,
    email,
    password,
    confirmpassword,
    ngoname: ngoname.toLowerCase(),
    phone,
    address,
    logitude,
    latitude,
    discription,
  });

  const Options = {
    httpOnly: true,
    secure: true,
  };
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    ngo._id
  );

  const createdNgo = await Ngo.findById(ngo._id).select(
    "-password -confirmpassword -refreshToken"
  );

  if (!createdNgo) {
    throw new ApiError(500, "Something went wrong while registering the ngo");
  }

  return res
    .status(201)
    .cookie("accessToken", accessToken, Options)
    .cookie("refreshToken", refreshToken, Options)
    .json(new ApiResponse(200, createdNgo, "ngo registered Successfully"));

});

export {ngoSignUp};