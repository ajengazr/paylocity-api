import joi from "joi";

const timeFormat = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
const dateFormat = /^\d{4}-\d{2}-\d{2}$/;

const createOvertimeValidation = joi.object({
    date: joi.string().pattern(dateFormat).required().messages({
        "string.pattern.base": "Format date harus YYYY-MM-DD"
    }),
    startTime: joi.string().pattern(timeFormat).required().messages({
        "string.pattern.base": "Format startTime harus HH:mm"
    }),
    endTime: joi.string().pattern(timeFormat).required().messages({
        "string.pattern.base": "Format endTime harus HH:mm"
    }),
    dayType: joi.string().valid("WEEKDAY", "WEEKEND").required(),
    reason: joi.string().min(5).max(255).required()
});

const createOvertimeByAdminValidation = joi.object({
    employeeId: joi.number().integer().positive().required().messages({
        "number.base": "employeeId harus berupa angka",
        "number.positive": "employeeId harus lebih dari 0",
        "any.required": "employeeId wajib diisi"
    }),
    date: joi.string().pattern(dateFormat).required().messages({
        "string.pattern.base": "Format date harus YYYY-MM-DD"
    }),
    startTime: joi.string().pattern(timeFormat).required().messages({
        "string.pattern.base": "Format startTime harus HH:mm"
    }),
    endTime: joi.string().pattern(timeFormat).required().messages({
        "string.pattern.base": "Format endTime harus HH:mm"
    }),
    dayType: joi.string().valid("WEEKDAY", "WEEKEND").required(),
    reason: joi.string().min(5).max(255).required()
});

const updateOvertimeByAdminValidation = joi.object({
    date: joi.string().pattern(dateFormat).optional().messages({
        "string.pattern.base": "Format date harus YYYY-MM-DD"
    }),
    startTime: joi.string().pattern(timeFormat).optional(),
    endTime: joi.string().pattern(timeFormat).optional(),
    dayType: joi.string().valid("WEEKDAY", "WEEKEND").optional(),
    reason: joi.string().min(5).max(255).optional()
});

const updateOvertimeStatusValidation = joi.object({
    status: joi.string().valid("APPROVED", "REJECTED").required()
});

const getOvertimeValidation = joi.number().positive().required().messages({
    "number.base": "ID harus berupa angka",
    "number.positive": "ID harus lebih dari 0"
});

export {
    createOvertimeValidation,
    createOvertimeByAdminValidation,
    updateOvertimeByAdminValidation,
    updateOvertimeStatusValidation,
    getOvertimeValidation
};