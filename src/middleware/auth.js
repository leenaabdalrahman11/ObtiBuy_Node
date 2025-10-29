import jwt from "jsonwebtoken";

export const auth = () =>{
    return async(req,res,next)=>{
        const {token} = req.headers;
        if(!token){
            return res.status(400).json({message:"invalid auth"});
        }
        const decoded = jwt.verify(token,process.env.LOGINSIG);
        return res.json(decoded);
        req.id = decoded.id;
        next();
    }
}