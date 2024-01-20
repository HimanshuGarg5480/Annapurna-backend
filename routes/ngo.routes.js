import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  changeNgoPassword,
  getCurrentNgo,
  getNgoDonatedBy,
  getNgoDonations,
  loginNgo,
  logoutNgo,
  ngoSignUp,
  refreshAccessToken,
} from "../controllers/ngo.controller.js";
import verifyNgoJWT from "../middlewares/ngoAuth.middleware.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "NgoImage",
      maxCount: 1,
    },
  ]),
  ngoSignUp
);

router.route("/login").post(loginNgo);

router.route("/logout").post(verifyNgoJWT, logoutNgo);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyNgoJWT,changeNgoPassword);
router.route("/get-current-ngo").get(verifyNgoJWT,getCurrentNgo);
router.route("/get-ngo-donations").get(verifyNgoJWT,getNgoDonations);
router.route("/get-ngo-donatedby").get(verifyNgoJWT,getNgoDonatedBy);

export default router;
