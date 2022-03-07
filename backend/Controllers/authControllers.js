const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../Models/User");

const authController = {
  // REGISTER
  registerUser: async (req, res) => {
    try {
      // HasHed password
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(req.body.password, salt);

      // Create new user
      const newUser = await new User({
        username: req.body.username,
        email: req.body.email,
        password: hashed,
      });

      // Save to DB
      const user = await newUser.save();
      return res.status(200).json(user);
    } catch (err) {
      res.status(500).json(err);
    }
  },
  // LOGIN
  loginUser: async (req, res) => {
    try {
      const user = await User.findOne({ username: req.body.username });
      if (!user) {
        res.status(404).json("Wrong username!");
      }
      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!validPassword) {
        res.status(404).json("Wrong password!");
      }
      if (user && validPassword) {
        const accessToken = jwt.sign(
          {
            id: user.id,
            admin: user.admin,
          },
          process.env.JWT_ACCESS_KEY,
          { expiresIn: "2h" }
        );
        const {password, ...others} = user._doc;
        return res.status(200).json({...others, accessToken});
      }
    } catch (err) {
      res.status(500).json(err);
    }
  },
};

module.exports = authController;
