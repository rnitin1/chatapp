const express = require ('express');
const app = express();
const user = require('./routes/user')
const swaggerUi = require('swagger-ui-express');
const swaggerJsDocs = require("./config/userSwagger.json");
const mongoose = require('mongoose');
const path = require('path')
const session= require('express-session');
const passport = require('passport')
const initializePassport = require('./config/passport')
const chat = require('./lib/socketManager')
require('dotenv').config()
const socket = require('socket.io')
const http = require('http');
const server = http.createServer(app);
// socket.connectSocket(server)



//initializing swagger
app.use('/documentation',swaggerUi.serve,swaggerUi.setup(swaggerJsDocs));

//connection to mongodb
mongoose.connect("mongodb://localhost:27017/chat-app"
            ,{useNewUrlParser:true
            ,useUnifiedTopology:true}
)

//passport initialization
// initializePassport(passport)
initializePassport(
    passport,
    email=> User.findOne({email:email
    })
    //id=>user.find(user =>user.id===id)
    )


// app.set('views',path.join(__dirname,'views'))
// app.set('view engine','ejs')


//middlewares
// app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({extended:false}));
app.use(session({
    secret:process.env.SESSION_SESSION,
    resave:false,
    saveUninitialized:false,
}))
app.use(passport.initialize());
app.use(passport.session());
app.use('/',user);
chat.connectSocket(server)
// socket(chat)

const port = process.env.PORT || 5000 ;
server.listen(port, ()=>console.log(`server is running at port ${port}`));