import joi from "joi";

// ============ CUSTOM VALIDATION FUNCTIONS ============

const validatePeriodFormat = (value, helpers) => {
    const [year, month] = value.split("-").map(Number);
    
    if (isNaN(year) || isNaN(month)) {
        return helpers.message("Format period harus YYYY-MM (contoh: 2026-06)");
    }
    
    if (month < 1 || month > 12) {
        return helpers.message("Bulan harus antara 01 sampai 12");
    }
    
    if (year < 2000 || year > 2100) {
        return helpers.message("Tahun harus antara 2000 sampai 2100");
    }
    
    return value;
};

const validatePeriodNotFuture = (value, helpers) => {
    const [year, month] = value.split("-").map(Number);
    const periodEndDate = new Date(year, month, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (periodEndDate > today) {
        return helpers.message(`Periode ${value} belum bisa diproses. Payroll hanya bisa diproses setelah bulan berakhir.`);
    }
    
    return value;
};

const validatePeriodNotTooOld = (value, helpers) => {
    const [year, month] = value.split("-").map(Number);
    const periodDate = new Date(year, month - 1, 1);
    const today = new Date();
    const maxOldMonths = 12;
    
    const diffMonths = (today.getFullYear() - year) * 12 + (today.getMonth() - (month - 1));
    
    if (diffMonths > maxOldMonths) {
        return helpers.message(`Periode ${value} sudah terlalu lama. Maksimal ${maxOldMonths} bulan ke belakang.`);
    }
    
    return value;
};

// ============ VALIDATION SCHEMAS ============

const createPayrollValidation = joi.object({
    period: joi.string()
        .pattern(/^\d{4}-\d{2}$/)
        .required()
        .custom(validatePeriodFormat)
        .custom(validatePeriodNotFuture)
        .custom(validatePeriodNotTooOld)
        .messages({
            "string.pattern.base": "Format period harus YYYY-MM (contoh: 2026-06)",
            "any.required": "Period wajib diisi"
        })
});

const getPayrollPeriodValidation = joi.string()
    .pattern(/^\d{4}-\d{2}$/)
    .required()
    .custom(validatePeriodFormat)
    .messages({
        "string.pattern.base": "Format period harus YYYY-MM (contoh: 2026-06)",
        "any.required": "Period wajib diisi"
    });

const getMyPayslipsQueryValidation = joi.object({
    period: joi.string()
        .pattern(/^\d{4}-\d{2}$/)
        .optional()
        .custom(validatePeriodFormat)
        .messages({
            "string.pattern.base": "Format period harus YYYY-MM (contoh: 2026-06)"
        }),
    page: joi.number()
        .integer()
        .min(1)
        .default(1)
        .messages({
            "number.base": "Page harus berupa angka",
            "number.min": "Page minimal 1"
        }),
    limit: joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10)
        .messages({
            "number.base": "Limit harus berupa angka",
            "number.min": "Limit minimal 1",
            "number.max": "Limit maksimal 100"
        }),
    sortBy: joi.string()
        .valid("period", "createdAt", "netSalary", "totalEarnings")
        .default("period"),
    sortOrder: joi.string()
        .valid("asc", "desc")
        .default("desc")
});

const getPayslipByEmployeeValidation = joi.object({
    employeeId: joi.number()
        .positive()
        .required()
        .messages({
            "number.base": "employeeId harus berupa angka",
            "number.positive": "employeeId harus lebih dari 0",
            "any.required": "employeeId wajib diisi"
        }),
    period: joi.string()
        .pattern(/^\d{4}-\d{2}$/)
        .optional()
        .custom(validatePeriodFormat)
        .messages({
            "string.pattern.base": "Format period harus YYYY-MM (contoh: 2026-06)"
        }),
    page: joi.number().integer().min(1).default(1),
    limit: joi.number().integer().min(1).max(100).default(10)
});

const updatePayrollStatusValidation = joi.object({
    status: joi.string()
        .valid("PROCESSED", "CANCELLED", "COMPLETED")
        .required()
        .messages({
            "any.only": "Status harus salah satu dari: PROCESSED, CANCELLED, COMPLETED",
            "any.required": "Status wajib diisi"
        })
});

const deletePayrollValidation = joi.object({
    period: joi.string()
        .pattern(/^\d{4}-\d{2}$/)
        .required()
        .custom(validatePeriodFormat)
        .messages({
            "string.pattern.base": "Format period harus YYYY-MM (contoh: 2026-06)",
            "any.required": "Period wajib diisi"
        })
});

export {
    createPayrollValidation,
    getPayrollPeriodValidation,
    getMyPayslipsQueryValidation,
    getPayslipByEmployeeValidation,
    updatePayrollStatusValidation,
    deletePayrollValidation
};