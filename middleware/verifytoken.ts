import {NextFunction, Request, Response} from "express"
import {AppConstants} from "../utils/appconstants"
import {User} from "../models/users";


const jwt = require('jsonwebtoken')

async function verifyToken(req: Request, res: Response, next: NextFunction) {

    const authHeader = req.headers.authorization
    if (authHeader) {
        const parts = authHeader.split(' ')
        if (parts.length > 1) {

            const token = parts[1]
            let valid = await User.findOne({
                where: {
                    deviceToken: token
                },
                attributes: ["id"]
            })

            if (token && (valid != null)) {

                jwt.verify(token, Buffer.from(AppConstants.ACCESS_TOKEN_SECRET, 'base64'), {
                    algorithms: ['HS256'],

                }, (err: any, user: any) => {
                    if (err) {

                        if (err.name == "TokenExpiredError") {
                            console.log(err.message)

                            return res.status(401).send(JSON.stringify({"message": "Full authentication is required to access this resource"}))
                        } else {
                            return res.status(401).send(JSON.stringify({"message": "Full authentication is required to access this resource"}))
                        }
                    } else {
                        console.log(user)
                        req.body["user"] = user.sub
                        next()
                    }
                })
            } else {
                return res.status(401).send(JSON.stringify({"message": "Full authentication is required to access this resource"}))
            }
        } else {
            return res.status(401).send(JSON.stringify({"message": "Full authentication is required to access this resource"}))
        }
    } else {
        return res.status(401).send(JSON.stringify({"message": "Full authentication is required to access this resource"}))
    }

}

export default {
    verifyToken
}

