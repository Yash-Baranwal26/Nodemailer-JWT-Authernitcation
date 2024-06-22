const express = require('express')
const jwt = require('jsonwebtoken')
const app = express();
const mongoose = require('mongoose')
const userData = require('./Schema')
const bodyParser = require('body-parser')
const cors = require('cors')
const nodemailer = require('nodemailer')
const crypto = require('crypto')

const secretKey = "secretkey"

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/learnJWT")
.then((res)=>{
    console.log('DB connected')
}).catch(err=>{
    console.log(err)
})

const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
     user: "stranger2copy@gmail.com", //Gmail Address
     pass: "axlt cryx qopc nzds", //Password of gmail (Genrated app password)    
     }
})

app.post("/register",async (req,res)=>{
    const{name,email,username,password} = req.body

    let send = await userData.create({
        name:name,
        email:email,
        username:username,
        password:password
    })

    if(send)
        {
            res.status(200).json({"msg":"Data Inserted"})
        }
        else{
            res.status(400).json({"error":"Inavalid argu"})
        }
})

app.post("/login",async(req,res)=>{
    const{username,password}=req.body;
 
    let login = await userData.findOne({username:username})

    if(login){
        let cpass = await userData.findOne({password:password})
        if(cpass){
            // res.status(200).json({"msg":"U are a authorized user"})
            jwt.sign({userData},secretKey,{expiresIn: '300s'}, (err,token)=>{
                res.json({
                    token
                })
            })
        }
        else{
            res.status(400).json({"error":"Wrong Password"})
        }
}
    else{
        res.status(400).json({"error":"Wrong User"})
    }
})

app.post('/forget-password', async (req,res)=>{
    const{email} = req.body;

    let user = await userData.findOne({email:email})

    if(!user){
        res.status(400).json({'err':'User with this email does not exist'})
    }

    const otp = crypto.randomInt(100000,999999).toString();
    user.resetPasswordOTP = otp;
    user.otpExpiry = Date.now() + 3600000; // OTP valid for 1 hr
    await user.save()

    const mailOption = {
        from: '"Yash Baranwal" <stranger2copy@gmail.com>',
        to: email,
        subject: 'Pssword reset OTP',
        text: `Your OTP IS ${otp}`
    }

    transport.sendMail(mailOption, (err,info)=>{
        if(err){
            return res.status(400).json({'err':'Unable to send OTP'})
        } else{
            return res.status(200).json({'msg':'Otp sent Successfully'})
        }
    })
})

app.post('/verify-otp', async(req,res)=>{
    const {email,otp} = req.body;
    const user = await userData.findOne({email:email})

    if(!user){
        res.status(400).json({'err':"User with this email does not exist"})
    }
    
    if(user.resetPasswordOTP === otp && user.otpExpiry > Date.now()){
        user.isOTPVerified = true;
        await user.save();
        res.status(200).json({'msg':'OTP Verified'})
    }else{
        res.status(400).json({'err':'Invalid OTP'})
    }

})

app.post('/reset-password',async (req,res)=>{
    const {email, newPassword} = req.body;

    const user = await userData.findOne({email:email})

    if(!user){
        res.status(400).json({'err':"User with this email does not exist"})
    }

    if(user.isOTPVerified){
        user.password = newPassword;
        user.resetPasswordOTP = undefined;
        user.otpExpiry = undefined;
        user.isOTPVerified = false;
        await user.save();

        res.status(200).json({'msg':'Password reset successfully'})
    } else{
        res.status(400).json({'err':'OTP not verified'})
    }
})

app.get('/protected', verifyToken, (req, res) => {
    res.json({ message: 'Protected route accessed successfully' });
  });

function verifyToken(req,res,next){
    const bearerHeader = req.headers['authorization']

    if(typeof bearerHeader !== 'undefined'){
        const bearer = bearerHeader.split(" ");
        const token = bearer[1];

        jwt.verify(token, secretKey, (err, authData)=>{
            if(err){
                res.status(401).json({ error: 'Unauthorized' });
            }
            else{
                req.authData = authData;
                next();
            }
        })
    }else{
        res.send({
            result:'Token is not valid'
        })
    }
}

app.listen(1234, ()=>{
    console.log('App is runing on PORT 1234')
})
