import { Ngo } from "../models/ngo.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
const verifyNgoJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookie?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  
    const ngo = await Ngo.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    if(!ngo){
      throw new ApiError(401,"Invalid Access Token")
    }
    req.ngo=ngo;
    next();
  } catch (error) {
    throw new ApiError(401,error.message||"Invalid access token")
  }
});
export default verifyNgoJWT;
