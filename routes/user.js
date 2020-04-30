const express = require('express');
const router = express.Router()
const user = require('../controller/user')
const upload = require('../lib/uploadimage')
const passport = require('passport')



router.post('/emailverificationforsignup',user.emailverification)//------done
router.post('/signup',user.signup);//-------done
router.post('/login',checkNotAuthenticate,passport.authenticate('local',{}),user.login);//-----done
// router.post('/loginwithfacebook',user.loginwithfacebook);
router.post('/resetpasswordtoken',user.resetpasswordtoken)//---done
router.post('/resetpassword',user.resetpassword);//-------------done
router.put('/changepassword',user.changepassword);//-----------done
router.delete('/logout',checkAuthenticate,user.logout);//---------------done
router.post('/uploadimage',upload.uploadimage);//-----done
router.post('/createchatroom',checkNotAuthenticate,user.createchatroom);
// router.get('/getuserprofile',user.getuserprofile)
// router.get('/showotherprofile',user.showotherprofile)
// router.post('/inviteuser',user.inviteuser);
// router.delete('/deletechatroom',user.deletechatroom);
// router.get('/accesschatrooms',user.accesschatrooms);
// router.put('/edituserprofile', user.edituserprofile);
// router.post('/newmassege',user.newmessage);
// router.get('/chatmessages',user.chatmessages);
router.get('/renderuploadimage', upload.renderimage)//------done
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
        return res.send('login first')
    }else{
        return next()
    }
}

module.exports=router;