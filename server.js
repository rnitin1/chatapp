const express = require ('express');
const app = express();
const user = require('./routes/user')
const swaggerUi = require('swagger-ui-express');
const swaggerJsDocs = require("./config/userSwagger.json");
const mongoose = require('mongoose');

//initializing swagger
app.use('/documentation',swaggerUi.serve,swaggerUi.setup(swaggerJsDocs));

//connection to mongodb
mongoose.connect("mongodb://localhost/chatapp"
            ,{useNewUrlParser:true
            ,useUnifiedTopology:true}
)

//middlewares
app.use(express.urlencoded({extended:false}))

app.use('/',user);

const port = process.env.PORT || 5000 ;
app.listen(port, ()=>console.log(`server is running at port ${port}`));