import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async function (user_id) {
  try {  
    const user = await User.findById(user_id);  
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res

  const { email, username, password,confirmpassword } = req.body;
  // console.log("email: ", email);

  if ([email, username, password,confirmpassword].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  if (password !== confirmpassword) {
    throw new ApiError(409, "password and confirm-password are not same");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }
  
  const avatarLocalPath = req.files?.avatar[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {   
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }
  
  const user = await User.create({
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    confirmpassword,
    username: username.toLowerCase(),
  });

  const Options = {
    httpOnly: true,
    secure: true,
  };
  const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id);

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201).cookie("accessToken", accessToken, Options).cookie("refreshToken", refreshToken, Options)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //req body->data
  const { username, email, password } = req.body;
  //username or email
  if ([email, username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  //find the user
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(409, "User with email or username does not exists");
  }
  //password check
  const isPasswordvalid = await user.isPasswordCorrect(password);
  if (!isPasswordvalid) {
    throw new ApiError(401, "passoword incorrect");
  }
  //access and refersh token
  const { accessToken, refreshToken } = generateAccessAndRefreshToken(user._id);
  const logedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  //send cookie
  const Options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, Options)
    .cookie("refreshToken", refreshToken, Options)
    .json(
      new ApiResponse(
        200,
        {
          user: { logedInUser, accessToken, refreshToken },
        },
        "user logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    {
      new: true,
    }
  );
  const Options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(201)
    .clearCookie("accessToken", Options)
    .clearCookie("refreshToken", Options)
    .json(new ApiResponse(201, {}, "user logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookie.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
      throw new ApiError(401, "unauthorized request");
    }
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh Token is expired or used");
    }

    const { accessToken, refreshToken } = generateAccessAndRefreshToken(
      user._id
    );
    res
      .status(200)
      .cookie("accessToken", accessToken)
      .cookie("refreshToken", refreshToken)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token");
  }
});

const changeUserPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  if (newPassword != confirmPassword) {
    throw new ApiError(401, "newPassword and confirmPassword are different");
  }
  const user = await findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "wrong old password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  res
    .status(201)
    .json(new ApiResponse(200, {}, "password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(201)
    .json(new ApiResponse(200, req.user, "fetched current user successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeUserPassword,
  getCurrentUser
};
