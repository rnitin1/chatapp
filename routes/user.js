const express = require('express');
const router = express.Router()
const user = require('../controller/user')

router.get('/emailverificationforsignup',user.emailverification)
// router.post('/signup',user.signup);
// router.post('/loginp',user.login);
// router.post('/loginwithfacebook',user.loginwithfacebook);
// router.post('/loginwithgoogle',user.loginwithgoogle);
// router.post('/resetpasswordtoken',user.resetpasswordtoken)
// router.post('/resetpassword',user.resetpassword);
// router.put('/changepassword',user.changepassword);
// router.delete('/logout',user.logout);
// router.post('/uploadimage',user.uploadimage);
// router.post('/createchatroom',user.createchatroom);
// router.get('/getuserprofile',user.getuserprofile)
// router.get('/showotherprofile',user.showotherprofile)
// router.post('/inviteuser',user.inviteuser);
// router.delete('/deletechatroom',user.deletechatroom);
// router.get('/accesschatrooms',user.accesschatrooms);
// router.put('/edituserprofile', user.edituserprofile);
// router.post('/newmassege',user.newmessage);
// router.get('/chatmessages',user.chatmessages);




module.exports=router;