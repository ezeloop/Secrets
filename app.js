//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended:true
}));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  email: String,
  password : String
});


userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

const User = new mongoose.model("User", userSchema);


app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});


app.get("/", function(req, res){
  res.render("home");
});

app.post("/register", function(req, res){

  // empezamos con mongoose, asi que creamos un nuevo newUser que va a seguir el modelo de userDB
  //al email y password lo sacamos de lo que ingreso en el form con .body
  const newUser= new User({
    email:req.body.username,
    password: req.body.password
  });
newUser.save(function(err){
  //aca guardamos esos datos en la db, si hubo error q lo muestre, y si no, le pintamos la pagina /secrets
  if(err){
    console.log(err);
  }
  else{
    res.render("secrets");
  }
});

});

app.post("/login", function(req, res){
  //aca tenemos que ver si el usuario esta registrado para mostrarle todo, asi que vemos su email y pass si estan bien

  const username = req.body.username;
  const password = req.body.password;

  //ahora que tenemos estos datos que ingreso, tenemos que compararlos en nuestra base de datos
User.findOne({email:username}, function(err, foundUser){
  if(err){
    console.log(err);
  }else{
    if(foundUser)   //si encuentra un foundUser hace lo de abajo
    {
      if(foundUser.password === password){
        res.render("secrets");
      }
    }
  }
});
});

app.listen(3000, function(){
  console.log("Server sarted on port 3000");
});
