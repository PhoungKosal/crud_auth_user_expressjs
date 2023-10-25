const express = require('express')
const router = express.Router();
const { 
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

} = require('../controllers/userController');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
router.post('/register', createUser);
router.post('/login', loginUser);
router.get('/all-users', getallUser);
router.get('/refresh', handleRefreshToken);
router.get('/logout', logout);
router.get('/:id', authMiddleware,isAdmin, getSingleUser);
router.delete('/:id', deleteUser);
router.put('/:id',authMiddleware, isAdmin, updateUser);
router.put('/block-user/:id',authMiddleware, isAdmin, block);
router.put('/unblock-user/:id',authMiddleware, isAdmin, unblock);


module.exports = router;