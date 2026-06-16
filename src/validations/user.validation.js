import joi from "joi";

const registerValidation = joi.object({
    username: joi.string().min(3).max(30).required(),
    email: joi.string().email().min(3).max(100).required(),
    password: joi.string().min(6).max(100).required(),
    role: joi.string()
    .valid("HR_ADMIN")
    .default("HR_ADMIN")
});

const loginValidation = joi.object({
    email: joi.string().email().min(3).max(100).required(),
    password: joi.string().min(6).max(100).required()
});

const getAllAdminValidation = joi.object({
    page: joi.number().positive().default(1),
    limit: joi.number().positive().max(100).default(10)
});

const updateUserValidation = joi.object({
    username: joi.string().min(3).max(30).optional(),
    email: joi.string().email().min(3).max(100).optional()
});

const deleteUserValidation = joi.number().positive();

//untuk memvalidasi hanya user yang sedang login yang boleh masuk.
const getUserValidate = joi.number().positive();

export { registerValidation, loginValidation, getAllAdminValidation, updateUserValidation, deleteUserValidation, getUserValidate };
