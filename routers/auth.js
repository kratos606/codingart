const router = require('express').Router();
const {loginController,registerController,checkController,logoutController} = require('../controllers/auth');
const {verifyToken} = require('../middlewares/verifyToken')

router.post('/login', loginController);
router.post('/register', registerController);
router.get('/check',checkController);
router.get('/logout',verifyToken, logoutController);

module.exports = router;