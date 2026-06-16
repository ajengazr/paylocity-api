import employeeService from "../services/employee-service.js";

async function createEmployee(req, res, next) {
    try {
        const request = req.body;
        const result = await employeeService.create(request);
        return res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

async function getAllEmployees(req, res, next) {
    try {
        const result = await employeeService.getAll();  
        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

async function getEmployeeById(req, res, next) {
    try {
        const employeeId = parseInt(req.params.id); 
        const result = await employeeService.getById(employeeId);
        if (!result) {
            return res.status(404).json({   
                success: false,
                errors: "Employee tidak ditemukan"
            });
        }   
        return res.status(200).json({
            success: true,
            data: result
        });
    }   
    catch (error) {
        next(error);
    }
}

async function updateEmployee(req, res, next) {
    try {
        const employeeId = parseInt(req.params.id);
        const request = req.body;
        const result = await employeeService.update(employeeId, request);
        if (!result) {
            return res.status(404).json({
                success: false,
                errors: "Employee tidak ditemukan"
            });
        }
        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

async function deleteEmployee(req, res, next) {
    try {
        const employeeId = parseInt(req.params.id);
        const result = await employeeService.remove(employeeId);
        if (!result) {
            return res.status(404).json({
                success: false,
                errors: "Employee tidak ditemukan"
            });
        }
        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

async function getMyProfile(req, res, next) {
    try {
        const result = await employeeService.getByUserId(req.user.id);
        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

async function updateMyProfile(req, res, next) {
    try {
        const result = await employeeService.updateByUserId(req.user.id, req.body);
        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

export default { createEmployee, getAllEmployees, getEmployeeById, updateEmployee, deleteEmployee, getMyProfile, updateMyProfile }