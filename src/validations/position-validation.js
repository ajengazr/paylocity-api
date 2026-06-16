import joi from "joi";

const createPositionValidation = joi.object({
    name: joi.string().min(2).max(100).required(),
    departmentId: joi.number().positive().required()
});

const updatePositionValidation = joi.object({
    name: joi.string().min(2).max(100).optional(),
    departmentId: joi.number().positive().optional()
});

const getPositionValidation = joi.number().positive();

const deletePositionValidation = joi.number().positive();

export { createPositionValidation, updatePositionValidation, getPositionValidation, deletePositionValidation };