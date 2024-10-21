const { generateToken } = require("../../../configs/jwtToken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const { generateRefreshToken } = require("../../../configs/refreshtoken");
// validateMongoose
const validateMongoDBID = require("../validations/validateMongoDB");
const jwt = require("jsonwebtoken");
// Create user
const createUser = asyncHandler(async (req, res) => {
  const { firstname, lastname, email, mobile, password } = req.body;

  try {
    // validate fields
    // if (!firstname || !lastname || !email || !mobile || !password) {
    //   res.status(400).json({ message: "Please enter all required fields" });
    // }

    // create new user & check user exists
    const findUser = await User.findOne({ email });
    if (!findUser) {
      const newUser = await User.create(req.body);
      res.sendStatus(200).json({ newUser });
    } else {
      res.status(400).json({ message: "User already exists" });
    }
  } catch (error) {
    res.status(500).json({ menubar: "Server is under maintenance" });
  }

  // const email = req.body.email;

  // try {
  //     const findUser = await User.findOne({ email });

  //     if (!findUser) {
  //         // Create a new user
  //         const newUser = await User.create(req.body);
  //         res.json(newUser);
  //     } else {
  //         throw new Error('User already exists');
  //     }
  // } catch (error) {
  //     // Handle the error here
  //     res.status(400).json({ message: error.message });
  // }
});

// login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if a user with the given email exists
    const findUser = await User.findOne({ email });

    if (findUser) {
      // If the user exists, check if the provided password matches the stored password
      const isPasswordMatched = await findUser.isPasswordMatched(password);

      if (isPasswordMatched) {
        const refreshToken = await generateRefreshToken(findUser._id);

        // Update the refreshToken for the user
        await User.findByIdAndUpdate(findUser._id, { refreshToken });

        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          maxAge: 72 * 60 * 60 * 1000, // 3 days
          secure: true, // Set to true in production (requires HTTPS)
          sameSite: "none", // Allow cross-origin cookie sharing
        });

        const accessToken = generateToken(findUser._id);
        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          maxAge: 72 * 60 * 60 * 1000, // 3 days
          secure: true, // Set to true in production (requires HTTPS)
          sameSite: "none", // Allow cross-origin cookie sharing
        });

        // Passwords match, so send the user data as a response
        return res.json({
          message: "Login successfully",
          _id: findUser._id,
          firstname: findUser.firstname,
          lastname: findUser.lastname,
          email: findUser.email,
          mobile: findUser.mobile,
          token: accessToken,
        });
      }
    }

    // If the user does not exist or the passwords do not match, return an error response.
    return res.status(400).json({ error: "Invalid email or password" });
  } catch (error) {
    // Handle any errors that may occur during the process
    console.error("Error:", error);
    return res.status(500).json({ error: "An error occurred during login" });
  }
});

// handle refresh token
const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No refresh token in the cookie");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });

  if (!user)
    throw new Error("No Refresh token present in the db or does not match");

  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error("There is something wrong with the refresh token");
    }
    const accessToken = generateToken(user._id);
    res.json({ accessToken });
  });
});

// logout functionality
const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) {
    return res.status(400).json({ message: "No refresh token in the cookie" });
  }
  const refreshToken = cookie.refreshToken;

  try {
    const user = await User.findOne({ refreshToken });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found with the given refreshToken" });
    }

    await User.findByIdAndUpdate(user._id, {
      refreshToken: "",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });

    res.sendStatus(204);
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while processing the logout request",
    });
  }
});

// get all the users
const getallUser = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find();
    res.json({ getUsers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single user by ID
const getSingleUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  try {
    // Check if the userId is a valid MongoDB ObjectId
    validateMongoDBID(userId);

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ error: "User not found" });
    } else {
      res.json({ user });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a user by ID
const updateUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  try {
    // Check if the userId is a valid MongoDB ObjectId
    validateMongoDBID(userId);

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ error: "User not found" });
    } else {
      // Update user properties based on request data
      user.firstname = req.body.firstname || user.firstname;
      user.lastname = req.body.lastname || user.lastname;
      user.email = req.body.email || user.email;
      user.mobile = req.body.mobile || user.mobile;

      // Save the updated user
      await user.save();

      res.json({ message: "User updated successfully" });
    }
  } catch (error) {
    // Corrected the status code and error message
    res.status(500).json({ error: error.message });
  }
});

// Delete a user by ID
const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  try {
    // Check if the userId is a valid MongoDB ObjectId
    validateMongoDBID(userId);

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ error: "User not found" });
    } else {
      await user.deleteOne();
      res.sendStatus(200).json({ message: "User deleted successfully" });
    }
  } catch (error) {
    // Corrected the status code and error message
    res.status(500).json({ error: error.message });
  }
});

// blcoked user

const block = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBID(id);
  try {
    const blocked = await User.findOneAndUpdate(
      { _id: id }, // Use the _id field for the user to block
      { isBlocked: true }, // Set isBlocked to true
      { new: true } // Return the updated document
    );

    if (!blocked) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(blocked);
  } catch (error) {
    throw new Error(error);
  }
});

// unblock the user
const unblock = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBID(id);
  try {
    const unblocked = await User.findOneAndUpdate(
      { _id: id }, // Use the _id field for the user to unblock
      { isBlocked: false }, // Set isBlocked to false
      { new: true } // Return the updated document
    );

    if (!unblocked) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "User Unblocked",
    });
  } catch (error) {
    // Properly handle errors by sending an error response
    res.status(500).json({ error: error.message });
  }
});

module.exports = {
  createUser,
  loginUser,
  getallUser,
  getSingleUser,
  deleteUser,
  updateUser,
  block,
  unblock,
  handleRefreshToken,
  logout,
};
