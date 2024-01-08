const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const userModel = require('./Models/userRegistration');

app.use(express.json());
app.use(cors());

const DB_URL = process.env.DB_URL;

mongoose.connect(DB_URL).then(()=>{
    try{
        console.log("connected to database");
    } catch(err){
        console.log('DB Error');
    }
})

app.post("/register", async (req, res) => {
    try {
      const { username, email, password } = req.body;
      let exists = await userModel.findOne({ email });
      if (username === "") {
        return res.status(400).json({ message: "Username required" , status: 400});
      } else if (email === "") {
        return res.status(400).json({ message: "Email required", status: 401 });
      } else if (password === "") {
        return res.status(400).json({ message: "Password required", status: 402 });
      }
      else if (exists) {
        return res.status(400).json({ message: "Email Id already exist" , status: 404});
      }  
       else {
        const hashedPassword = await bcrypt.hash(password, 10);
        await userModel.create({ username, email, password: hashedPassword });
        return res.status(200).json({ message: "User registerd successfully", status: 200 });
      }
    } catch (err) {
      console.log("Register Error :",err);
    }
  });

app.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      let exists = await userModel.findOne({ email });
      if (email === "" || password === "") {
        return res.status(400).json({ message: "Email and password required" });
      } else if (!exists) {
        return res.status(404).json({ message: "Email doesn't exist, Register First" });
      } else {
        const passwordMatch = await bcrypt.compare(password, exists.password);
        if (!passwordMatch) {
            return res.status(400).json({ message: "Password doesn't match" });
        }
        const payload = {
          user: {
            id: exists.id,
          },
        };
        /* console.log(payload);*/
        jwt.sign(
          payload,
          "jwtSecret",
          { expiresIn: 3600000 },
          async (err, token) => {
            try {
              if (err) throw err;
              else {
                await res.json({ token });
              }
            } catch (e) {
              console.log(e);
            }
          }
        );
      }
    } catch (e) {
      console.log(e);
    }
  });
  
  app.listen(8000, () => {
    console.log("connected to server");
  });