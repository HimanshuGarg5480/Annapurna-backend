import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Ngo } from "../models/ngo.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async function (ngo_id) {
  try {
    const ngo = await Ngo.findById(ngo_id);
    const accessToken = ngo.generateAccessToken();
    const refreshToken = ngo.generateRefreshToken();
    ngo.refreshToken = refreshToken;
    await ngo.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token"
    );
  }
};
// Create a new ngo
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
    NgoImage: ngoImage.url,
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

const loginNgo = asyncHandler(async (req, res) => {
  //req body->data
  const { ngoname, email, password } = req.body;
  //ngoname or email
  if ([ngoname, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  //find the ngo
  const ngo = await Ngo.findOne({
    email: email,
  });
  // console.log(ngoname," ", email," ", password,)
  if (!ngo) {
    throw new ApiError(409, "Ngo with email or ngoname does not exists");
  }
  //password check
  const isPasswordvalid = await ngo.isPasswordCorrect(password);
  // console.log(isPasswordvalid)
  if (!isPasswordvalid) {
    throw new ApiError(401, "passoword incorrect");
  }
  //access and refersh token
  const { accessToken, refreshToken } = generateAccessAndRefreshToken(ngo._id);
  const logedInNgo = await Ngo.findById(ngo._id).select(
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
          ngo: { logedInNgo, accessToken, refreshToken },
        },
        "ngo logged in successfully"
      )
    );
});

const logoutNgo = asyncHandler(async (req, res) => {
  await Ngo.findByIdAndUpdate(
    req.ngo._id,
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
    .json(new ApiResponse(201, {}, "ngo logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookie?.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
      throw new ApiError(401, "unauthorized request");
    }
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const ngo = await Ngo.findById(decodedToken._id);
    if (!ngo) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    if (incomingRefreshToken !== Ngo.refreshToken) {
      throw new ApiError(401, "Refresh Token is expired or used");
    }

    const { accessToken, refreshToken } = generateAccessAndRefreshToken(
      ngo._id
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

const changeNgoPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  if (newPassword != confirmPassword) {
    throw new ApiError(401, "newPassword and confirmPassword are different");
  }
  const ngo = await findById(req.ngo?._id);
  const isPasswordCorrect = await ngo.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "wrong old password");
  }
  ngo.password = newPassword;
  await ngo.save({ validateBeforeSave: false });

  res
    .status(201)
    .json(new ApiResponse(200, {}, "password changed successfully"));
});

const getCurrentNgo = asyncHandler(async (req, res) => {
  return res
    .status(201)
    .json(new ApiResponse(200, req.ngo, "fetched current user successfully"));
});

const getNgoDonations = asyncHandler(async (req, res) => {
  const ngo = await Ngo.findOne({ _id: req.ngo?._id }).populate({
    path: "donations",
  });
  //console.log(user);
  return res.status(201).json(
    new ApiResponse(
      200,
      {
        Donations: ngo.donations,
      },
      "fetched donations successfully"
    )
  );
});

const getNgoDonatedBy = asyncHandler(async (req, res) => {
  const ngo = await Ngo.findOne({ _id: req.ngo?._id }).populate({
    path: "users",
  });
  //console.log(user);
  return res.status(201).json(
    new ApiResponse(
      200,
      {
        Donations: ngo.donationBy,
      },
      "fetched Users successfully"
    )
  );
});
export {
  ngoSignUp,
  loginNgo,
  logoutNgo,
  refreshAccessToken,
  changeNgoPassword,
  getCurrentNgo,
  getNgoDonations,
  getNgoDonatedBy
};
