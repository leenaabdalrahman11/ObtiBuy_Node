import jwt from "jsonwebtoken";
import userModel from "../../DB/models/user.model.js";

export const auth = (accessRole = []) =>{
    return async(req,res,next)=>{
        const {token} = req.headers;
        if(!token){
            return res.status(400).json({message:"invalid auth"});
        }
        const decoded = jwt.verify(token,process.env.LOGINSIG);
        const user = await userModel.findById(decoded.id);
        
        if(!accessRole.includes(user.role)){
            return res.status(400).json({message: "not auth user "});
        }
        req.id = decoded.id;
        next();
    }
}