const express = require('express');
const router = express.Router()
const user = require('../controller/user')
const upload = require('../lib/uploadimage')
const passport = require('passport')



router.post('/emailverificationforsignup',user.emailverification)//------done==
router.post('/signup',user.signup);//-------done
router.post('/login',checkNotAuthenticate,passport.authenticate('local',{}),user.login);//-----done
router.post('/resetpasswordtoken',user.resetpasswordtoken)//---done==
router.post('/resetpassword',user.resetpassword);//-------------done==
router.put('/changepassword',checkAuthenticate,user.changepassword);//-----------done==
router.delete('/logout',checkAuthenticate,user.logout);//---------------done==
router.post('/uploadimage',checkAuthenticate,upload.uploadimage);//-----done====
router.put('/createchatroom',checkAuthenticate,user.createchatroom);//=======done====
router.post('/searchuser',checkAuthenticate,user.searchuser)//============done==
router.delete('/deletechatroom',checkAuthenticate,user.deletechatroom);//======done=====
router.get('/accesschatrooms',checkAuthenticate,user.accesschatrooms);// ==============done==
router.put('/edituserprofile',checkAuthenticate, user.edituserprofile);//-----done===
router.put('/addusers',checkAuthenticate,user.addusers);//=============done====
router.post('/loginwithfacebook',user.loginwithfacebook);
// router.get('/chatmessages',user.chatmessages);



//checking authentication
function checkAuthenticate(req,res,next) {
    if(req.isAuthenticated()){
        return next()
    }else{
        return res.send('login first')
    }
}


function checkNotAuthenticate(req,res,next) {
    if(req.isAuthenticated()){
        return res.send('logout first')
    }else{
        return next()
    }
}

module.exports=router;