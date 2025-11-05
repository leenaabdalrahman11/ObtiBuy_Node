import jwt from "jsonwebtoken";

export const auth = () => (req, res, next) => {
    try {
        const h = req.headers.authorization || req.headers.Authorization;
        if (!h) return res.status(401).json({ message: "Missing Authorization header" });

        if (!/^Bearer\s+/i.test(h)) {
            return res.status(401).json({ message: "Invalid scheme (use: Bearer <token>)" });
        }
        const token = h.split(" ")[1]?.trim();
        if (!token) return res.status(401).json({ message: "Empty token" });

        const secret = process.env.LOGINSIG;
        if (!secret) return res.status(500).json({ message: "Server misconfig: JWT_SECRET missing" });

        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        return next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token", name: err?.name, error: err?.message });
    }
};
