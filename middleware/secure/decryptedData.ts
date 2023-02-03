const config = require("config")
import {NextFunction, Request, Response} from "express"

const crypto = require("crypto");

const API_KEY_DEC = config.get("API_KEY_DEC")
const API_DECRYPT_VI_KEY = config.get("API_DECRYPT_VI_KEY")

async function DecryptedDataResponse(req: Request, res: Response, next: NextFunction) {

    try {
        const decipher = await crypto.createDecipheriv("aes-256-cbc", API_KEY_DEC, API_DECRYPT_VI_KEY);
        if (req.body && req.body.value && req.body.value !== "") {
            let encryptedData = req.body.value;
            let decryptedData = decipher.update(encryptedData, "base64", "utf-8");
            decryptedData += decipher.final("utf-8");
            req.body = JSON.parse(decryptedData);
        }
        next();
    } catch (e) {
        console.log("DECRYPT :", req.url)
        return res.status(422).send({
            "message": "Couldn't process data"
        })
    }


}


async function DecryptedData(req: Request, res: Response, next: NextFunction) {
    if (req.headers.env) {
        if (req.headers.env === 'test') {
            next();
        } else {
            return DecryptedDataResponse(req, res, next);
        }
    } else {
        return DecryptedDataResponse(req, res, next);
    }
}


export default {
    DecryptedData,
}
