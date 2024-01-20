import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
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
router.route("/refresh-token").post(refreshAccessToken)

export default router;
