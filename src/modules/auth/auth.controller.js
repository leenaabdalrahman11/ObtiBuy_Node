import userModel from "../../../DB/models/user.model.js";
import bcrypt from "bcryptjs";

import { sendEmail } from "../../utils/sendEmail.js";
import { customAlphabet, nanoid } from "nanoid";
import jwt from "jsonwebtoken";

export const register = async (req, res, next) => {
    try {
        const { userName, email, password, confirmpassword } = req.body;

        const user = await userModel.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "Email already registered" });
        }

if ((password || '').trim() !== (confirmpassword || '').trim()) {
    return res.status(400).json({ message: "Passwords do not match" });
}
        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUND));

        const createdUser = await userModel.create({
            userName,
            email,
            password: hashedPassword
        });
     //   await sendEmail(email,"confirm email");
        const token = jwt.sign({email},process.env.CONFIRMEMAILSIGNAL);
        const html = `
        <div>
          <h1>Confirm Email</h1>
          <a href="${req.protocol}://${req.headers.host}/auth/confirmEmail/${token}">confirm email</a>
        </div>
        
        `
        await sendEmail(email,"confirm email",html);
        return res.status(201).json({ message: "Success", user: createdUser });
    } catch (error) {
        next(error);
    }
}

export const confirmEmail=async (req,res)=>{
    const {token} = req.params;
    const decoded = jwt.verify(token,process.env.CONFIRMEMAILSIGNAL);
    await userModel.findOneAndUpdate({email:decoded.email},{confirmEmail:true});
    return res.status(200).json({message:"success"});
}

export const login = async(req,res)=>{
    const {email,password} = req.body;
    const user = await userModel.findOne({email});

    if(!user){
        return res.status(400).json({message:"invalid data"});
    }
    if(!user.confirmEmail){
        return res.status(400).json({message:"plz confirm your email"});
    }
    if(user.status == 'not_active'){
        return res.status(400).json({message: "your account is block "});
    }
    const match = await bcrypt.compare(password,user.password);

    if(!match){
        return res.status(400).json({message:"invaild"});
    }

    const token = jwt.sign({id:user._id,userName:user.userName,role:user.role},process.env.LOGINSIG);
    return res.status(200).json({message:"success",token});
}

export const sendCode = async(req,res)=>{
    const {email} = req.body;
    const code = customAlphabet('1234567890abcdef',4)();
    const user = await userModel.findOneAndUpdate({email},{sendCode:code});
    const html = `<h2>code is ${code}</h2>`;
    await sendEmail(email,'reset password',html);
    return res.status(200).json({message:"success"});
}
export const resetPassword =async (req,res)=>{
    const {email} = req.body;
    const {code} = req.body;
    const {newPassword} = req.body;
    const user = await userModel.findOne({email});
    if(!user){
        return res.status(400).json({message:"not register account"});
    }
    if(user.sendCode != code){
        return res.status(400).json({message:"invalid code"});
    }
    const hashedPassword =await bcrypt.hash(newPassword,parseInt(process.env.SALT_ROUND));
    user.password = hashedPassword;
    user.sendCode = null;
    await user.save();
        return res.status(200).json({message:"success"});
        
}