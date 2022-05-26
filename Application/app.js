
const express = require('express');
var session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require("path");
const app = express();
const mongoose = require("mongoose")
const User = require('./model/user')



// -------- mongo - nodejs connection -------
mongoose.connect("mongodb+srv://dimitris:Cd2iV6XWeteaoE8r@cluster0.yfueb.mongodb.net/dimitris?retryWrites=true&w=majority" ,  {useNewUrlParser: true, useUnifiedTopology: true , useCreateIndex: true},(error)=> {
    if(!error)
    {
        console.log("Success Connection with database")
    }
    else{
        console.log("Error connecting to database.")
    }
} )


const publicDirectory = path.join(__dirname , './public');
app.use(express.static(publicDirectory));

app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.set('view engine' ,'hbs');






app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true})); // --------SESSIONS--------




app.use(bodyParser.json());      
app.use(bodyParser.urlencoded({extended: true}));
const viewsDirectory = path.join(__dirname,'./views');
app.use(express.static(viewsDirectory));





//-------------DEFINE ROUTES-------------

app.use('/' , require('./routes/pages'))

app.use('/auth' , require('./routes/auth'));




//------------ PORT LISTEN TO 4000 --------------

app.listen(4000, ()=> {
    console.log("Server starts at port 4000")
})