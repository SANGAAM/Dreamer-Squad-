const express = require("express");
const path = require("path");
const app = express();
const hbs=require("hbs");

const server = require("http").createServer(app);
const io = require("socket.io")(server);

require("./db/conn");
const Register = require("./models/registers");
 
const port = process.env.PORT || 3000;

io.on("connection", function(socket){
    socket.on("newuser",function(username){
        socket.broadcast.emit("update", username + "joined the conversation");
    });
    socket.on("exituser",function(username){
        socket.broadcast.emit("update", username + "left the conversation");
    });
    socket.on("chat",function(message){
        socket.broadcast.emit("chat", message);
    });
})

app.use(express.static(path.join(__dirname+"/public")));

const static_path = path.join(__dirname, "../public")
const templates_path = path.join(__dirname, "../templates/views")
const partials_path = path.join(__dirname, "../templates/partials")
 
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(express.static(static_path)); 
app.set("view engine", "hbs");
app.set("views", templates_path);
hbs.registerPartials(partials_path);

app.get("/", (req,res)=>{
    res.render("index");
})

app.get("/register", (req,res)=>{
    res.render("register");
})

app.get("/login", (req,res)=>{
    res.render("login");
})

app.get("/index2",(req,res)=>{
    res.render("index2");
})

// creating new user databse
app.post("/register", async (req,res)=>{
    try{
         const password = req.body.password;
         const cpassword = req.body.confirmpassword;
         if(password===cpassword){
               const registerEmployee = new Register({
                      firstname: req.body.firstname,
                      lastname: req.body.lastname,
                      email: req.body.email,
                      phonenumber: req.body.phonenumber,
                    //   city: req.body.city,
                      password: req.body.password,
                      confirmpassword: req.body.confirmpassword
               })

             const register = await  registerEmployee.save();
             res.status(201).render("index");
         }else(
            res.send("passwords are not matching")
         )
    }catch(error){
       res.status(400).send(error);
    }
})

app.post("/login", async(req,res)=>{
    try{
        const email = req.body.email;
        const password = req.body.password;

        const useremail = await Register.findOne({email:email});
       if(useremail.password === password){
        res.static(201).render("index");
       }else{
        res.send("invalid details");
       }


    } catch (error){
        res.status(400).send("invalid details");
    }
})

app.post("/index",async(req,res)=>{
    try{
    res.static(201).render("index2");
    }
    catch(error){
        res.status(400).send(error);
     }
})

app.listen(port, () => {
    console.log(`server is running at port no ${port}`);
})