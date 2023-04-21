import {Server} from 'socket.io'
import {AppConstants} from './utils/appconstants'
import {SequelizeDbHelper} from "./dbhelpers/sequelizeDbHelper"

import SocketHandler from "./controllers/SocketHandler";


import {User} from "./models/users";
import express, {NextFunction, Request, Response} from "express";
import bodyParser from "body-parser";
import decryptedData from "./middleware/secure/decryptedData";
import expressJwt from "express-jwt";
import {Router} from "./routers/api_router";
import {Post} from "./models/post";
import {Like} from "./models/like";
import {Comment} from "./models/comment";


const config = require("config")
const app = express();
const server = require('http').Server(app)

// sequelize connect to mysql
let sequelizeDbHelper = SequelizeDbHelper.getInstance()
let sequelizeClient = sequelizeDbHelper.getSequelizeClint()

//Socket IO Server
const io: Server = require('socket.io')(server)
const cors = require("cors");
app.use(
    cors({
        origin: "*",
    })
);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

app.use(bodyParser.json({limit: '200mb'}))
app.use(bodyParser.urlencoded({limit: '200mb', extended: true}))
app.use(express.static('public'))

app.use(decryptedData.DecryptedData)

app.use(expressJwt({
    secret: Buffer.from(AppConstants.ACCESS_TOKEN_SECRET, 'base64'),
    algorithms: ['HS256'],
    requestProperty: 'body.user',
    getToken: function fromHeaderOrQuerystring(req: Request) {
        const authHeader = req.headers.authorization
        if (authHeader) {
            const parts = authHeader.split(' ')
            return parts.length > 1 ? parts[1] : null
        }
        return null
    }
}).unless(({
    path: [
        AppConstants.API_PATH_LOGIN,
        AppConstants.API_PATH_VERIFY_OTP,
        AppConstants.API_PATH_FORGOT,
        AppConstants.API_PATH_RESET,
        AppConstants.API_PATH_RESEND_OTP,
        AppConstants.API_PATH_POST_REGISTER,
        AppConstants.API_STORAGE + "/",
        "/socket/api/demo",
    ]
})))

app.use(async function (err: any, req: Request, res: Response, next: NextFunction) {
    if (err.name === 'UnauthorizedError') {
        return res.status(401).send(JSON.stringify({"message": "Full authentication is required to access this resource"}))
    }
    next()
})

app.use(Router)


/**
 * Server is listening on this PORT
 */
server.listen(config.get("PORT"), async () => {
    try {

        console.log(`⚡️[NodeJs server]: Server is running at http://localhost:${config.get("PORT")}`)

        /**
         *  Initializes SequelizeClient (SQL CONNECTION)
         *  Add Models classes
         *  Sync Instance
         */
        await sequelizeClient.authenticate().then(async () => {
            console.log('Connection has been established successfully.')
            // ORM Relation with DB tables
            sequelizeClient.addModels([User, Post, Like, Comment])

            Post.belongsTo(User, {as: "uploader", targetKey: "id", foreignKey: "postUploaderUserId"})
            User.hasMany(Post, {foreignKey: "postUploaderUserId"})

            Like.belongsTo(User, {as: "liker", targetKey: "id", foreignKey: "postLikeUserId"})
            User.hasMany(Like, {foreignKey: "postLikeUserId"})

            Comment.belongsTo(User, {as: "commenter", targetKey: "id", foreignKey: "postCommentUserId"})
            User.hasMany(Comment, {foreignKey: "postCommentUserId"})


            await sequelizeClient.sync()

            /**
             * This function/delegate will handle socket connection of specific client with different namespaces.
             *  // const nameSpaceInstance = io.of("name_space")
             *  // nameSpaceInstance.on('connection', (socket: Socket) => {})
             */
            io.on("connection", SocketHandler.chatHandler)


        }).catch((reason: any) => console.log('[Sequelize Error] ', reason))


    } catch (error) {
        console.error(error)
    }

})

export {io}
