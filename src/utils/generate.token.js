import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
async function generateToken(user) {
    const token = await jwt.sign(
        {id: user.id, email: user.email, role: user.role},
        process.env.JWT_TOKEN,
        {expiresIn: process.env.JWT_EXP}
    );

    return token;
}

export {generateToken};