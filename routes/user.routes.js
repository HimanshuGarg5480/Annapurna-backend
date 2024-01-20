import { Router } from "express";
import { changeUserPassword, getCurrentUser, getUserDonatedTo, getUserDonations, loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import verifyJWT from "../middlewares/userAuth.middleware.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT,changeUserPassword);
router.route("/get-current-user").get(verifyJWT,getCurrentUser);
router.route("/get-user-donations").get(verifyJWT,getUserDonations);
router.route("/get-user-donatedTo").get(verifyJWT,getUserDonatedTo);

export default router;
