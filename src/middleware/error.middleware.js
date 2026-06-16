import { ResponseError } from "../errors/response.error.js";
import joi from "joi";

export function errorMiddleware(err, req, res, next){
    console.error(err);
    if(err instanceof ResponseError){
        return res.status(err.status).json({
            success: false,
            errors: err.message
        });
    }else if(err instanceof joi.ValidationError) {
        return res.status(400).json({
            success: false, 
            errors: err.message
        });
    }else{
        return res.status(500).json({
            success: false,
            errors: err.message
        });
    }
}

