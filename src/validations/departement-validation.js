import joi from "joi";

const createDepartmentValidation = joi.object({
    name: joi.string().min(2).max(100).required(),
});

const updateDepartmentValidation = joi.object({
    name: joi.string().min(2).max(100).optional(),
});

const getDepartmentValidation = joi.number().positive();

const deleteDepartmentValidation = joi.number().positive();

export { createDepartmentValidation, updateDepartmentValidation, getDepartmentValidation, deleteDepartmentValidation };