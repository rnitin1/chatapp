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
router.put('/changepassword',checkAuthenticate,user.changepassword);//-----------done
router.delete('/logout',checkAuthenticate,user.logout);//---------------done
router.post('/uploadimage',checkAuthenticate,upload.uploadimage);//-----done
router.post('/createchatroom',checkAuthenticate,user.createchatroom);
// router.get('/getuserprofile',user.getuserprofile)
router.post('/searchuser',checkAuthenticate,user.searchuser)
// router.post('/inviteuser',user.inviteuser);
// router.delete('/deletechatroom',user.deletechatroom);
// router.get('/accesschatrooms',user.accesschatrooms);
router.put('/edituserprofile',checkAuthenticate, user.edituserprofile);//-----done
// router.post('/newmassege',user.newmessage);
// router.get('/chatmessages',user.chatmessages);
router.get('/renderuploadimage', checkAuthenticate,upload.renderimage)//------done



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