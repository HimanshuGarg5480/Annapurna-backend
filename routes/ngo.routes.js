import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import { ngoSignUp } from "../controllers/ngo.controller.js";
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

export default router