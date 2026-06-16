import { prismaClient } from "./application/db.js";
import { web } from "./application/web.js";
import dotenv from "dotenv";
import argon2 from "argon2";

dotenv.config();

const PORT = process.env.SERVER_PORT;


async function initializeAdminRole() {
    const hashedPassword = await argon2.hash("MNJ123");

    await prismaClient.user.upsert({
        where: {
            email: "manajer123@gmail.com",
        },
        update: {},
        create: {
            username: "MANAJER",
            email: "manajer123@gmail.com",
            password: hashedPassword,
            role: "SUPER_ADMIN"
        },
    });

    console.log("Role SUPER ADMIN siap");
}

async function start() {
    try {
        await initializeAdminRole();

        web.listen(PORT, () => {
            console.log(`Server running di PORT ${PORT}`);
        });
    } catch(error){
        console.log(error);
    }
}

start();

