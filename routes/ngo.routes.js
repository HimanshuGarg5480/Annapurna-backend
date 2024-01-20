import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import verifyJWT from "../middlewares/userAuth.middleware.js";
import { loginNgo, ngoSignUp } from "../controllers/ngo.controller.js";
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

router.route("/login").post(
  loginNgo
);

export default router