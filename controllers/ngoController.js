const Ngo = require("../models/Ngos");
const bcrypt = require("bcrypt");
// Create a new user
exports.createNgo = async (req, res) => {
  let {
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

  try {
    if (!ngoname) {
      return res.json({
        message: "fill the ngoname field",
      });
    } else if (!email) {
      return res.json({
        message: "fill the email field",
      });
    } else if (!password) {
      return res.json({
        message: "fill the password field",
      });
    } else if (!confirmpassword) {
      return res.json({
        message: "fill the confirm-password field",
      });
    } else if (!phone) {
      return res.json({
        message: "fill the phone field",
      });
    } else if (!address) {
      return res.json({
        message: "fill the address field",
      });
    } else if (!logitude) {
      return res.json({
        message: "fill the logitude field",
      });
    } else if (!latitude) {
      return res.json({
        message: "fill the latitude field",
      });
    } else if (!discription) {
      return res.json({
        message: "fill the latitude field",
      });
    }
    const ngo = await User.findOne({
      $or: [{ ngoname: ngoname }, { email: email }],
    });
    if (ngo) {
      return res.json({
        message: "ngoname or email already exists, try another one",
      });
    } else {
      const newNgo = new Ngo({
        ngoname,
        email,
        password,
        confirmpassword,
        phone,
        address,
        logitude,
        latitude,
        discription,
      });
      await newNgo.save();
      // console.log("New user created:", newUser);
      res
        .cookie("ngoIsLoggedIn", true, {
          maxAge: 1000 * 60 * 60 * 24,
          httpOnly: true,
        })
        .status(200)
        .send("success");
    }
  } catch (error) {
    console.error("Error creating user:");
    res.status(400).send(error);
  }
};

exports.loginNgo = async (req, res) => {
  let {
    ngoname,
    email,
    password,
    phone,
    address,
    logitude,
    latitude,
    discription,
  } = req.body;

  try {
    if (!ngoname) {
      return res.json({
        message: "fill the ngoname field",
      });
    } else if (!email) {
      return res.json({
        message: "fill the email field",
      });
    } else if (!password) {
      return res.json({
        message: "fill the password field",
      });
    } else if (!phone) {
      return res.json({
        message: "fill the phone field",
      });
    } else if (!address) {
      return res.json({
        message: "fill the address field",
      });
    } else if (!logitude) {
      return res.json({
        message: "fill the logitude field",
      });
    } else if (!latitude) {
      return res.json({
        message: "fill the latitude field",
      });
    } else if (!discription) {
      return res.json({
        message: "fill the latitude field",
      });
    }
    const ngo = await User.findOne({
      $or: [{ ngoname: ngoname }, { email: email }],
    });
    if (ngo) {
      const flag = await bcrypt.compare(password, ngo.password);
      if (flag) {
        res
          .cookie("ngoIsLoggedIn", true, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
          })
          .status(200)
          .send(ngo);
      } else {
        res.json({
          message: "password not matched",
        });
      }
    } else {
      return res.json({
        message: "ngoname or email not matched",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(400).json({
      message: error.message,
    });
  }
};
