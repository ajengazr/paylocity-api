import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
async function authMiddleware(req, res, next) {
    const cookie = req.cookies.accessToken;

    if (!cookie) {
        return res.status(401).json({
            message: "Belum Terverifikasi",
        });
    }
    
    try {
        const token = cookie;
        const decoded = jwt.verify(
            token, 
            process.env.JWT_TOKEN
        );
        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Token Tidak Valid.",
        });
    }
}

export {authMiddleware};