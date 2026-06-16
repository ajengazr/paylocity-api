import joi from "joi";

const createEmployeeValidation = joi.object({
    // Data User (dibuat sekaligus)
    username: joi.string().min(3).max(30).required(),
    email: joi.string().email().min(3).max(100).required(),
    password: joi.string().min(6).max(100).required(),

    // Data Employee
    nik: joi.string().min(5).max(100).required(),
    departmentId: joi.number().positive().required(), 
    positionId: joi.number().positive().required(),
    basicSalary: joi.number().positive().required(),
    taxStatus: joi.string().valid("TK0", "TK1", "TK2", "TK3", "K0", "K1", "K2", "K3").required(),
    joinDate: joi.date().iso().required(),
    status: joi.string().valid("ACTIVE", "INACTIVE").required(),
    year: joi.number().integer().optional(),
});

const updateEmployeeValidation = joi.object({
    username: joi.string().min(3).max(30).optional(),
    departmentId: joi.number().positive().optional(),  
    positionId:   joi.number().positive().optional(),  
    basicSalary: joi.number().positive().optional(),
    taxStatus: joi.string().valid("TK0", "TK1", "TK2", "TK3", "K0", "K1", "K2", "K3").optional(),
    status: joi.string().valid("ACTIVE", "INACTIVE").optional(),
});

const getEmployeeValidation = joi.number().positive();

const deleteEmployeeValidation = joi.number().positive();

export { createEmployeeValidation, updateEmployeeValidation, getEmployeeValidation, deleteEmployeeValidation };