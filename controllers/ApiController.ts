import {Request, Response} from 'express';

import commonutils from "../utils/commonutils";
import {User} from "../models/users";
import {AppConstants, GenderEnum} from "../utils/appconstants";
import Commonutils from "../utils/commonutils";
import {Post} from "../models/post";
import {Like} from "../models/like";
import {Sequelize} from "sequelize";
import {Comment} from "../models/comment";

const jwt = require('jsonwebtoken')
const config = require('config')
const multer = require('multer')
const fs = require('fs')


/**
 *   Login API
 * */
async function login(req: Request, res: Response) {

    let email : string = req.body.email?.toString()
    let password : string = req.body.password?.toString()


    let userDetails = await User.findOne({
        where: {
            email: email,
            password : password
        }
    })


    let user: User = new User()
    user.password = password
    user.email = email


    if (userDetails) {

        await User.update({
            // mobileNumber: mobileNumber,
            // countryCode: countryCode,
            password: password,
            email: email,
            updated_at: commonutils.getCurrentUTC(),
        }, {
            where: {
                id: userDetails.id
            },
            returning: true
        })
    } else {
        user.created_at = commonutils.getCurrentUTC()
        user.updated_at = commonutils.getCurrentUTC()
        await user.save()
    }


    let responseLogin = {
         userDetails
    }

    return commonutils.sendSuccess(req, res, responseLogin)


}


/**
 *   Verify OTP
 * */

async function verifyOTP(req: Request, res: Response) {

    let mobileNumber = req.body.mobileNumber?.toString()?.replaceAll(" ", "")
    let countryCode = req.body.countryCode?.toString()
    let otp = req.body.otp?.toString()
    let type = req.body.type?.toString()
    let deviceId: string = req.body.deviceId?.toString()
    let deviceType: string = req.body.deviceType?.toString()
    let deviceToken: string = req.body.deviceToken?.toString()
    let voipToken: string = req.body.voipToken?.toString() ?? ""

    let isNotify = req.body.isNotify ?? 0

    console.log("VERIFY_OTP ", req.body)


    let userDetails: User = await User.findOne({
        where: {
            mobileNumber: mobileNumber?.toString(),
            countryCode: countryCode?.toString()
        }
    })


    if (userDetails) {
        if (userDetails.otp?.toString() === otp) {

            let newData = {
                ...{
                    otp: null
                }
            }

            await User.update({
                deviceId: deviceId,
                deviceToken: deviceToken,
                deviceType: Number(deviceType),
                updated_at: commonutils.getCurrentUTC()
            }, {
                where: {
                    id: userDetails.id
                }
            })


            jwt.sign({"id": userDetails.id}, Buffer.from(AppConstants.ACCESS_TOKEN_SECRET, 'base64'), {expiresIn: '9999 years'}, async (err: any, token: any) => {

                if (!err) {
                    await User.update({
                        authToken: token,
                        ...newData,
                        updated_at: commonutils.getCurrentUTC()
                    }, {
                        where: {
                            id: userDetails.id
                        }
                    })

                    let customer = await User.findOne({
                        where: {
                            id: userDetails.id
                        }
                    })

                    let response = {
                        ...commonutils.formatUserDetails(customer),
                        ...{
                            "token": customer.authToken,
                        }
                    }

                    return commonutils.sendSuccess(req, res, response)
                }
            })

        } else {
            let response = {
                "message": "Invalid OTP",
                "errors": {
                    "otp": "Invalid OTP"
                }
            }

            return commonutils.sendError(req, res, response)
        }


    } else {
        let response = {
            "message": "Phone Number doesn't exits",
            "errors": {
                "phoneNo": "Phone Number doesn't exits"
            }
        }

        return commonutils.sendError(req, res, response)
    }
}

/**
 *  Resend OTP
 * */

async function resendOTP(req: Request, res: Response) {


    let mobileNumber: string = req.body.mobileNumber?.toString()?.replaceAll(" ", "")
    let countryCode: string = req.body.countryCode?.toString()
    let type: string = req.body.type?.toString()

    let exists = await User.count({
        where: {
            mobileNumber: mobileNumber,
            countryCode: countryCode
        }
    })

    if (exists > 0) {
        let otp: number = /*Number((Math.random() * (9999 - 1000) + 1000).toFixed())*/1111

        await User.update({
            otp: otp,
            updated_at: commonutils.getCurrentUTC()
        }, {
            where: {
                mobileNumber: mobileNumber,
                countryCode: countryCode
            }
        })


        return commonutils.sendSuccess(req, res, {
            // "otp": otp
        })
    } else {
        let response = {
            "message": "Mobile Number doesn't exits",
            "errors": {
                "mobileNumber": "Mobile Number doesn't exits"
            }
        }

        return commonutils.sendError(req, res, response)
    }
}

async function updateProfile(req: Request, res: Response) {

    let name: string = req.body.name?.toString()
    let gender: string = req.body.gender?.toString()
    let userId = req.body.user.id ?? ""

    let genderEnum: GenderEnum = GenderEnum.MALE
    switch (Number(gender)) {
        case 1:
            genderEnum = GenderEnum.MALE
            break
        case 2:
            genderEnum = GenderEnum.FEMALE
            break
    }

    let updateData = {
        "name": "",
        "gender": GenderEnum.MALE,
        "image": ""
    }

    if (name && name !== "") {
        updateData.name = name
    } else {
        delete updateData.name
    }

    if (gender && gender !== "") {
        updateData.gender = genderEnum
    } else {
        delete updateData.gender
    }

    let image = req.body.image

    if (image != undefined || image == "") {
        let same = await User.findOne({
            where: {
                id: userId
            },
            attributes: ["image"]
        })

        if (same.image != image && same.image !== "") {
            if (fs.existsSync(commonutils.getPubDir() + config.get("USERIMAGE") + same.image)) {
                fs.unlinkSync(commonutils.getPubDir() + config.get("USERIMAGE") + same.image)
            }
        }

        updateData.image = (same.image != image) ? image : same.image

    } else {
        delete updateData.image
    }

    await User.update(updateData, {
        where: {
            id: userId
        }
    })

    let user = await User.findOne({
        where: {
            id: userId
        }
    })

    return commonutils.sendSuccess(req, res, Commonutils.formatUserDetails(user))
}

async function uploadImage(req: any, res: Response) {
    try {

        let imagePath = config.get("USERIMAGE")

        const storage = multer.diskStorage({
            destination: function (req: Request, file: any, callback: any) {
                let serverImagePath = commonutils.getPubDir() + imagePath;

                if (!fs.existsSync(serverImagePath)) {
                    fs.mkdirSync(serverImagePath, {recursive: true});
                }
                callback(null, serverImagePath);
            },
            filename: function (req: Request, file: any, callback: any) {
                callback(null, file.originalname.replaceAll(" ", "")/*md5(Date.now()) + path.extname(file.originalname)*/);
            }
        });

        const imageFilter = (req: Request, file: any, cb: any) => {
            if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
                return cb(new Error('Please upload a Image'))
            }
            cb(undefined, true)
        };

        const uploadImage = multer({
            storage: storage,
            fileFilter: imageFilter,
            limits: {fileSize: AppConstants.MAX_FILE_SIZE}
        }).single('file');

        uploadImage(req, res, async (err: any) => {

            if (!req.file) {
                let message = {
                    'message': "Please select an image !!",
                }
                return commonutils.sendError(req, res, message);
            } else if (err) {
                console.log("ERRRRR ", err)
                let message = {
                    'message': err,
                }
                return commonutils.sendError(req, res, message);
            } else {

                let avatar = commonutils.getImagePath(1, req.file.filename)
                const responseData = {
                    "fileURL": avatar,
                    "fileName": req.file.filename
                };
                return commonutils.sendSuccess(req, res, responseData);
            }

        });
    } catch (err) {

        console.log("Errror Upload ", err)
        let message = {
            'message': "oops ,Something Went Wrong !!",
        }
        return commonutils.sendError(req, res, message);
    }
}

async function uploadPostMedia(req: any, res: Response) {
    try {

        let imagePath = config.get("USERPOST")

        const storage = multer.diskStorage({
            destination: function (req: Request, file: any, callback: any) {
                let serverImagePath = commonutils.getPubDir() + imagePath;

                if (!fs.existsSync(serverImagePath)) {
                    fs.mkdirSync(serverImagePath, {recursive: true});
                }
                callback(null, serverImagePath);
            },
            filename: function (req: Request, file: any, callback: any) {
                callback(null, file.originalname.replaceAll(" ", "")/*md5(Date.now()) + path.extname(file.originalname)*/);
            }
        });

        const imageFilter = (req: Request, file: any, cb: any) => {
            if (!file.originalname.match(/\.(png|jpg|jpeg|mp4)$/)) {
                return cb(new Error('Please upload a file'))
            }
            cb(undefined, true)
        };

        const uploadImage = multer({
            storage: storage,
            fileFilter: imageFilter,
            limits: {fileSize: AppConstants.MAX_FILE_SIZE}
        }).single('file');

        uploadImage(req, res, async (err: any) => {

            if (!req.file) {
                let message = {
                    'message': "Please select an image !!",
                }
                return commonutils.sendError(req, res, message);
            } else if (err) {
                console.log("ERRRRR ", err)
                let message = {
                    'message': err,
                }
                return commonutils.sendError(req, res, message);
            } else {

                let avatar = commonutils.getImagePath(2, req.file.filename)
                const responseData = {
                    "fileURL": avatar,
                    "fileName": req.file.filename
                };
                return commonutils.sendSuccess(req, res, responseData);
            }

        });
    } catch (err) {

        console.log("Errror Upload ", err)
        let message = {
            'message': "oops ,Something Went Wrong !!",
        }
        return commonutils.sendError(req, res, message);
    }
}

async function uploadPost(req: Request, res: Response) {
    let userId = req.body.user.id
    let postMedia: string = req.body.postMedia?.toString()
    let postType: number = Number(req.body.postType?.toString())
    let postCaption: string = req.body.postCaption?.toString()
    let postThumbnail: string = req.body.postThumbnail?.toString()

    console.log("uploadPost %s", req.body)

    if (postThumbnail && !postThumbnail.match(/\.(png|jpg|jpeg)$/)) {
        return commonutils.sendError(req, res, {
            "message": "Invalid thumbnail data"
        })
    }

    if (postType == 2 && postMedia.match(/\.(png|jpg|jpeg)$/)) {
        return commonutils.sendError(req, res, {
            "message": "Invalid media content"
        })
    }

    if (postType == 1 && !postMedia.match(/\.(png|jpg|jpeg)$/)) {
        return commonutils.sendError(req, res, {
            "message": "Invalid media content"
        })
    }

    let post = new Post()
    post.postUploaderUserId = userId
    post.postType = postType
    post.postThumbnail = postThumbnail
    post.postCaption = postCaption
    post.postMedia = postMedia

    await post.save()

    await commonutils.sendSuccess(req, res, commonutils.formatPostDetail(post))
}

async function likePost(req: Request, res: Response) {
    let postId = Number(req.body.postId.toString())
    let action = req.body.action.toString()
    let userId = req.body.user.id

    let post = await Post.findOne({
        where: {
            id: postId
        }
    })

    if (post) {
        let likeDetail = await Like.findOne({
            where: {
                postId: Number(postId.toString()),
                postLikeUserId: Number(userId.toString())
            }
        })

        if (Number(action) == 1) {
            if (likeDetail) {
                await Like.update({
                    postId: postId,
                    postLikeUserId: userId
                }, {
                    where: {
                        postId: Number(postId.toString()),
                        postLikeUserId: Number(userId.toString())
                    }
                })
            } else {
                let like = new Like()
                like.postId = postId
                like.postLikeUserId = userId
                await like.save()
            }
        } else {
            if (likeDetail)
                await likeDetail.destroy()
        }

        if (action == 1) {
            await commonutils.sendSuccess(req, res, {
                "message": "Liked"
            })
        } else {
            await commonutils.sendSuccess(req, res, {
                "message": "Disliked"
            })
        }
    } else {
        await commonutils.sendError(req, res, {
            "message": "post is not available"
        })
    }
}

async function postList(req: Request, res: Response) {
    let userId = req.body.user.id

    let postList = await Post.findAll({
        include: [
            {
                model: User,
                as: "uploader",
                attributes: [
                    "name", "image"
                ]
            }
        ],
        attributes: [
            "id",
            "postUploaderUserId",
            "postType",
            "postCaption",
            "postMedia",
            "postThumbnail",
            [Sequelize.literal(`(SELECT COUNT(id) AS likeCount FROM likes WHERE likes.post_id = Post.id)`), 'likeCount'],
            [Sequelize.literal(`(SELECT COUNT(id) AS commentCount FROM comment WHERE comment.post_id = Post.id)`), 'commentCount'],
        ]
    })

    await commonutils.sendSuccess(req, res, await Promise.all(postList.map(async value => await commonutils.formatPostDetails(value))))
}

async function commentPost(req: Request, res: Response) {
    let userId = req.body.user.id
    let postId = Number(req.body.postId?.toString())
    let postComment = req.body.postComment?.toString()

    let post = Post.findOne({
        where: {
            id: postId
        }
    })

    if (postComment && post) {
        let comment = new Comment()
        comment.postComment = postComment
        comment.postCommentUserId = userId
        comment.postId = postId
        await comment.save()

        await commonutils.sendSuccess(req, res, {
            comment
        })
    }
}

async function likeList(req: Request, res: Response) {
    let postId = Number(req.query.postId?.toString())
    let likeList = await Like.findAll({
        where: {
            postId: postId
        },
        include: [
            {
                model: User,
                as: "liker",
                attributes: [
                    "name", "image"
                ]
            }
        ]

    })

    if (likeList) {
        await commonutils.sendSuccess(req, res, likeList)
    }
}

async function commentList(req: Request, res: Response) {
    let postId = Number(req.query.postId?.toString())
    let commentList = await Comment.findAll({
        where: {
            postId: postId
        },
        include: [
            {
                model: User,
                as: "commenter",
                attributes: [
                    "name", "image"
                ]
            }
        ]

    })

    if (commentList) {
        await commonutils.sendSuccess(req, res, commentList.map(value => commonutils.formatCommentList(value)))
    }
}

async function demo(req: Request, res: Response) {
    console.log("INSIDE DEMO")
    let questionId = req.body.questionId?.toString()
    let answer = req.body.answer

    for (let key in answer) {
        console.log(key +" " + answer[key]);
    }

}

export default {
    login,
    verifyOTP,
    resendOTP,
    updateProfile,
    uploadImage,
    uploadPost,
    uploadPostMedia,
    likePost,
    postList,
    commentPost,
    likeList,
    commentList,
    demo
}