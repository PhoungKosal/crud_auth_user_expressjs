const { generateToken } = require('../../../configs/jwtToken');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');

// Create user
const createUser = asyncHandler(async (req, res) => {
    const email = req.body.email;
    
    try {
        const findUser = await User.findOne({ email });

        if (!findUser) {
            // Create a new user
            const newUser = await User.create(req.body);
            res.json(newUser);
        } else {
            throw new Error('User already exists');
        }
    } catch (error) {
        // Handle the error here
        res.status(400).json({ message: error.message });
    }
});


// login user
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    // Check if a user with the given email exists
    const findUser = await User.findOne({ email });

    if (findUser) {
        // If the user exists, check if the provided password matches the stored password
        const isPasswordMatched = await findUser.isPasswordMatched(password);

        if (isPasswordMatched) {
            // Passwords match, so send the user data as a response
            res.json({
                _id: findUser?._id,
                firstname: findUser?.firstname,
                lastname: findUser?.lastname,
                email: findUser?.email,
                mobile: findUser?.mobile,
                token: generateToken(findUser?._id),
            });
        }
    }

    // If the user does not exist or the passwords do not match, return an error response.
    res.status(400).json({ error: 'Invalid Credentials' });
});


// get all the users
const getallUser = asyncHandler(async (req, res) => {
    try {
        const getUsers = await User.find();
        res.json({getUsers});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Get a single user by ID
const getSingleUser = asyncHandler(async (req, res) => {
    console.log(req.params)
    const userId = req.params.id; // Assuming the user ID is provided as a route parameter

    try {
        const user = await User.findById(userId);
        
        if (!user) {
            res.status(404).json({ error: 'User not found' });
        } else {
            res.json({user});
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a user by ID
const updateUser = asyncHandler(async (req, res) => {
    const userId = req.params.id; // Assuming the user ID is provided as a route parameter

    try {
        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({ error: 'User not found' });
        } else {
            // Update user properties based on request data
            user.firstname = req.body.firstname || user.firstname;
            user.lastname = req.body.lastname || user.lastname;
            user.email = req.body.email || user.email;
            user.mobile = req.body.mobile || user.mobile;

            // Save the updated user
            await user.save();

            res.json({ message: 'User updated successfully' });
        }
    } catch (error) {
        res.status(404).json({ error: ' not found' });
    }
});


// Delete a user by ID
const deleteUser = asyncHandler(async (req, res) => {
    const userId = req.params.id; // Assuming the user ID is provided as a route parameter

    try {
        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({ error: 'User not found' });
        } else {
            await user.deleteOne();
            res.json({ message: 'User deleted successfully' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// // block user 
// const blockUser = async (req, res) => {
//     try {
//       const { userIdToBlock } = req.params;
  
//       // Find the user to be blocked in the database
//       const userToBlock = await User.findById(userIdToBlock);
  
//       if (!userToBlock) {
//         return res.status(404).json({ error: 'User not found' });
//       }
  
//       // Check if the user performing the block is an admin or has the authority to do so
//       if (req.user.role !== 'admin') {
//         return res.status(403).json({ error: 'Permission denied' });
//       }
  
//       // Update the user's status to indicate that they are blocked
//       userToBlock.isBlocked = true;
//       await userToBlock.save();
  
//       return res.status(200).json({ message: 'User blocked successfully' });
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//     }
// };

// // Controller function for unblocking a user
// const unblockUserController = async (req, res) => {
//     try {
//       const { userIdToUnblock } = req.params;
  
//       // Find the user to be unblocked in the database
//       const userToUnblock = await User.findById(userIdToUnblock);
  
//       if (!userToUnblock) {
//         return res.status(404).json({ error: 'User not found' });
//       }
  
//       // Check if the user performing the unblock is an admin or has the authority to do so
//       if (req.user.role !== 'admin') {
//         return res.status(403).json({ error: 'Permission denied' });
//       }
  
//       // Update the user's status to indicate that they are unblocked
//       userToUnblock.isBlocked = false;
//       await userToUnblock.save();
  
//       return res.status(200).json({ message: 'User unblocked successfully' });
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//     }
// };
  
// const unblock = asyncHandler(async(req, res)=>{
//     const {id} = req.params;
//     try {
//         const unblocked = User.findOneAndUpdate(
//             id,
//         {
//             isBlocked:false,
//         },
//         {
//             new:true,
//         }
//       );
//       res.json({
//         message: "User Unblock"
//       })
//     } catch (error) {
//         throw new Error(error)
//     }
// })



// blcoked user 

const block = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const blocked = await User.findOneAndUpdate(
        { _id: id }, // Use the _id field for the user to block
        { isBlocked: true }, // Set isBlocked to true
        { new: true } // Return the updated document
      );
  
      if (!blocked) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.json({
        message: "User Blocked",
      });
    } catch (error) {
      throw new Error(error);
    }
});

// unblock the user
const unblock = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const unblocked = await User.findOneAndUpdate(
        { _id: id }, // Use the _id field for the user to unblock
        { isBlocked: false }, // Set isBlocked to false
        { new: true } // Return the updated document
      );
  
      if (!unblocked) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.json({
        message: "User Unblocked",
      });
    } catch (error) {
        throw new Error(error);
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
};
