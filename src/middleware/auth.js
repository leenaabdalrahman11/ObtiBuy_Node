import jwt from "jsonwebtoken";
import userModel from "../../DB/models/user.model.js";


export const auth = () => (req, res, next) => {
    try {
        const h = req.headers.authorization || req.headers.Authorization;
        if (!h) return res.status(401).json({ message: "Missing Authorization header" });

        if (!/^Leena\s+/i.test(h)) {
            return res.status(401).json({ message: "Invalid scheme (use: Leena <token>)" });
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