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
require('dotenv').config()
const socketio = require('socket.io')
const http = require('http');
const server = http.createServer(app);



//initializing swagger
app.use('/documentation',swaggerUi.serve,swaggerUi.setup(swaggerJsDocs));

//connection to mongodb
mongoose.connect("mongodb://localhost/chat-app"
            ,{useNewUrlParser:true
            ,useUnifiedTopology:true}
)

//passport initialization
initializePassport(passport)


// app.set('views',path.join(__dirname,'views'))
// app.set('view engine','ejs')


//middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());
//app.use(methodOverride('_method'))
app.use(express.urlencoded({extended:false}));
app.use(session({
    secret:'secret',
    resave:false,
    saveUninitialized:false,
}))

app.use('/',user);

const port = process.env.PORT || 5000 ;
server.listen(port, ()=>console.log(`server is running at port ${port}`));