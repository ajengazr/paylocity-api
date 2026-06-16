import { prismaClient } from "../application/db.js";
import { ResponseError } from "../errors/response.error.js";
import { generateToken } from "../utils/generate.token.js";
import { getUserValidate, loginValidation, registerValidation, updateUserValidation } from "../validations/user.validation.js";
import { validate } from "../validations/validation.js";
import argon2 from "argon2";

async function register(req) {
    req = validate(registerValidation, req);

    const emailDb = await prismaClient.user.count({
        where: {
            email: req.email
        }
    });

    if (emailDb === 1) {
        throw new ResponseError(404, "Email Sudah Terdaftar.");
    }

    const hashPass = await argon2.hash(req.password);
    req.password = hashPass;

    return prismaClient.user.create({
        data: {
            username: req.username,
            email: req.email,
            password: req.password,
            role: "HR_ADMIN"
        },
        select: {
            username: true,
            email: true,
            role: true
        }
    });
}

async function getById(userId) {
    userId = validate(getUserValidate, userId);

    const user = await prismaClient.user.findUnique({
        where: {
            id: userId
        },
        select: {
            username: true,
            email: true,
            role: true,        // ← TAMBAH
            createdAt: true,     // ← TAMBAH
            updatedAt: true,
        }
    });

    if (!user) {
        throw new ResponseError(404, "User Tidak Ditemukan.");
    }

    return user;
}

async function getAllAdmin() {
    return prismaClient.user.findMany({
        where: {
            role: "HR_ADMIN"
        },
        select: {
            id: true,
            username: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        }
    });
}

async function update(userId, req) {
    userId = validate(getUserValidate, userId);
    req = validate(updateUserValidation, req);

    const user = await prismaClient.user.findUnique({
        where: {
            id: userId
        }
    });

    if (!user) {
        throw new ResponseError(404, "User Tidak Ditemukan.");
    }

    const updatedUser = await prismaClient.user.update({
        where: {
            id: userId
        },
        data: {
            ...(req.username && { username: req.username }),
            ...(req.email && { email: req.email })
        }
    });

    return updatedUser;
}

async function remove(userId) {
    userId = validate(getUserValidate, userId);

    const user = await prismaClient.user.findUnique({
        where: {
            id: userId
        }
    });

    if (!user) {
        throw new ResponseError(404, "User Tidak Ditemukan.");
    }

    return prismaClient.user.delete({
        where: {
            id: userId
        }
    });
}

async function login(req) {
    req = validate(loginValidation, req);

    const user = await prismaClient.user.findUnique({
        where: {
            email: req.email
        }
    });
    if (!user) {
        throw new ResponseError(404, "Email Tidak Ditemukan.");
    }

    const verifyPass = await argon2.verify(user.password, req.password); //mengembalikan atau hasilnya boolean
    if (!verifyPass) {
        throw new ResponseError(400, "Password Salah.");
    }
    const token = await generateToken(user);

    return {
        username: user.username,
        email: user.email,
        role: user.role,
        token
    }

}

export default {
    register,
    login,
    getById,
    getAllAdmin,
    update,
    remove
};
