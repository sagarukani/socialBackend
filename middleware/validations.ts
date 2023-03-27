import {NextFunction, Request, Response} from "express"
import validator from "../utils/validate";
import commonutils from "../utils/commonutils";

async function loginValidation(req: Request, res: Response, next: NextFunction) {

    console.log(req);

    const validationRule = {
        "email": "required|string",
        "password": "required|string"
    }

    validator.validatorUtil(req.body, validationRule, {}, (err: any, status: boolean) => {
        if (!status) {
            console.log("ERRORS :", err)

            res.status(422)
                .send({
                    errors: commonutils.formattedErrors(err)
                });
        } else {
            next();
        }
    });

}

async function verifyOTPValidation(req: Request, res: Response, next: NextFunction) {

    const validationRule = {
        "mobileNumber": "required|string",
        "countryCode": "required|string",
        "otp": "required|size:4",
    }

    validator.validatorUtil(req.body, validationRule, {}, (err: any, status: boolean) => {
        if (!status) {
            console.log("ERRORS :", err)

            res.status(422)
                .send({
                    errors: commonutils.formattedErrors(err)
                });
        } else {
            next();
        }
    });

}

async function resendOTPValidation(req: Request, res: Response, next: NextFunction) {

    const validationRule = {
        "mobileNumber": "required|string",
        "countryCode": "required|string",
        "type": "required",
    }

    validator.validatorUtil(req.body, validationRule, {}, (err: any, status: boolean) => {
        if (!status) {
            console.log("ERRORS :", err)

            res.status(422)
                .send({
                    errors: commonutils.formattedErrors(err)
                });
        } else {
            next();
        }
    });

}

async function updateProfileValidation(req: Request, res: Response, next: NextFunction) {

    const validationRule = {
        "status": "maxLen",
    }

    validator.validatorUtil(req.body, validationRule, {}, (err: any, status: boolean) => {
        if (!status) {
            console.log("ERRORS :", err)

            res.status(422)
                .send({
                    errors: commonutils.formattedErrors(err)
                });
        } else {
            next();
        }
    });

}

async function blockValidation(req: Request, res: Response, next: NextFunction) {

    const validationRule = {
        "blockUserId": "required",
        "type": "required"
    }

    validator.validatorUtil(req.body, validationRule, {}, (err: any, status: boolean) => {
        if (!status) {
            console.log("ERRORS :", err)

            res.status(422)
                .send({
                    errors: commonutils.formattedErrors(err)
                });
        } else {
            next();
        }
    });

}

async function storyValidation(req: Request, res: Response, next: NextFunction) {

    const validationRule = {
        "storySettings": "required",
        "storyType": "required",
    }

    validator.validatorUtil(req.body, validationRule, {}, (err: any, status: boolean) => {
        if (!status) {
            console.log("ERRORS :", err)

            res.status(422)
                .send({
                    errors: commonutils.formattedErrors(err)
                });
        } else {
            next();
        }
    });

}

async function postValidation(req: Request, res: Response, next: NextFunction) {
    const validationRule = {
        "postType": "required|string",
        "postCaption":"required|string",
        "postMedia":"required|string"
    }

    validator.validatorUtil(req.body, validationRule, {}, (err: any, status: boolean) => {
        if (!status) {
            console.log("ERRORS :", err)

            res.status(422)
                .send({
                    errors: commonutils.formattedErrors(err)
                });
        } else {
            next();
        }
    });
}

export default {
    loginValidation,
    verifyOTPValidation,
    resendOTPValidation,
    updateProfileValidation,
    blockValidation,
    storyValidation,
    postValidation
}

