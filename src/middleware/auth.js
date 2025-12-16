import jwt from "jsonwebtoken";
import userModel from "../../DB/models/user.model.js";
export const auth = (accessRole = []) => {
  if (!Array.isArray(accessRole)) {
    accessRole = [accessRole];
  }

  return async (req, res, next) => {
    try {
      const h = req.headers.authorization || req.headers.Authorization;
      if (!h) {
        return res
          .status(401)
          .json({ message: "Missing Authorization header" });
      }

      if (!/^Leena\s+/i.test(h)) {
        return res
          .status(401)
          .json({ message: "Invalid scheme (use: Leena <token>)" });
      }

      const token = h.split(" ")[1]?.trim();
      if (!token) {
        return res.status(401).json({ message: "Empty token" });
      }

      const secret = process.env.LOGINSIG;
      if (!secret) {
        return res
          .status(500)
          .json({ message: "Server misconfig: LOGINSIG missing" });
      }

      const decoded = jwt.verify(token, secret);

      const user = await userModel.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      if (accessRole.length && !accessRole.includes(user.role)) {
        return res.status(403).json({ message: "Not authorized user" });
      }

      req.user = user;
      req.id = user._id;

      return next();
    } catch (err) {
      return res.status(401).json({
        message: "Invalid or expired token",
        error: err?.message,
      });
    }
  };
};
