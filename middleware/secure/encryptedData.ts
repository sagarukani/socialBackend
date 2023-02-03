import crypto from "crypto";
import {Request, Response} from "express"

const config = require("config")

const API_KEY_ENC = config.get("API_KEY_ENC")
const API_ENCRYPT_VI_KEY = config.get("API_ENCRYPT_VI_KEY")

async function encryptedDataResponse(data: any) {

    const cipher = crypto.createCipheriv("aes-256-cbc", API_KEY_ENC, API_ENCRYPT_VI_KEY);
    const message = JSON.stringify(data);
    let encryptedData = cipher.update(message, "utf-8", "base64");
    encryptedData += cipher.final("base64");

    const mac = crypto.createHmac('sha256', API_KEY_ENC)
        .update(Buffer.from(Buffer.from(API_ENCRYPT_VI_KEY).toString("base64") + encryptedData, "utf-8").toString())
        .digest('hex');

    return {
        'mac': mac,
        'value': encryptedData
    };
}


async function EncryptedData(req: Request, res: Response, data: any) {
    if (req.headers.env) {
        if (req.headers.env === 'test') {
            return data;
        } else {
            return await encryptedDataResponse(data);
        }
    } else {
        return await encryptedDataResponse(data);
    }
}

export default {
    EncryptedData,
}
