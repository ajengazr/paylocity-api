import authService from "../services/auth.service.js";

async function userRegister(req, res, next) {
    try {
        const request = req.body;
        const result = await authService.register(request);
        return res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

async function getAllAdmin(req, res, next) {
    try {
        const result = await authService.getAllAdmin();
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

async function getUserById(req, res, next) {
    try {
        const userId = parseInt(req.params.id);
        const result = await authService.getById(userId);
        res.status(200).json({
            success: true, 
            data: result
        });
    } catch (error) {
        next(error);
    }   
}

async function updateUser(req, res, next) {
    try {
        const userId = parseInt(req.params.id); 
        const updateData = req.body;
        const result = await authService.update(userId, updateData);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}   

async function deleteUser(req, res, next) {
    try {
        const userId = parseInt(req.params.id);     
        await authService.remove(userId);
        res.status(200).json({
            success: true,
            message: "User berhasil dihapus."
        });
    } catch (error) {
        next(error);
    }
}

async function userLogin(req, res, next) {
    try {
        const request = req.body;
        const result = await authService.login(request);
        res.cookie("accessToken", result.token, {
            httpOnly: true, 
            secure: false,
            sameSite: "lax",
            maxAge: 864000000
        });

        return res.status(200).json({
            success: true, 
            data: result
        });
    } catch (error) {
        next(error);
    }
}



async function userLogout(req, res, next) {
    try {
        res.clearCookie("accessToken");

        return res.status(200).json({
            success: true,
            message: "Berhasil."
        })
    } catch (error) {
        next(error);
    }
}

export default {
    userRegister,
    getAllAdmin,
    getUserById,
    updateUser,
    deleteUser,
    userLogin,
    userLogout
};