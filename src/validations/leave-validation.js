import joi from "joi";

const createLeaveValidation = joi.object({
    type:      joi.string().valid("TAHUNAN", "SAKIT", "MELAHIRKAN", "PENTING").required(),
    startDate: joi.date().iso().required(),
    endDate:   joi.date().iso().min(joi.ref("startDate")).required().messages({
        "date.min": "Tanggal selesai harus sama atau setelah tanggal mulai."
    }),
    reason:    joi.string().min(5).max(255).required()
});

const updateLeaveStatusValidation = joi.object({
    status:       joi.string().valid("APPROVED", "REJECTED").required(),
    rejectedNote: joi.when("status", {
        is:   "REJECTED",
        then: joi.string().min(5).max(255).required().messages({
            "any.required": "Catatan penolakan wajib diisi saat menolak pengajuan."
        }),
        otherwise: joi.string().optional()
    })
});

const getLeaveValidation = joi.number().positive();

export { createLeaveValidation, updateLeaveStatusValidation, getLeaveValidation };