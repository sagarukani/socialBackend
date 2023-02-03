import {AppConstants} from "./appconstants";

import moment from "moment";
import encryptedData from "../middleware/secure/encryptedData";
import {Request, Response} from "express";
import {User} from "../models/users";
import {Post} from "../models/post";
import {Comment} from "../models/comment";
import {Like} from "../models/like";
import {assignWith} from "lodash";

const config = require("config")
const path = require('path')
const os = require('os')
const md5 = require("md5");

const getRootDir = () => path.parse(process.cwd()).root
const getHomeDir = () => os.homedir()
const getPubDir = () => "./public"


function formatDate(date: any, format = AppConstants.DATE_FORMAT) {
    return moment(date).format(format)
}


async function sendSuccess(req: Request, res: Response, data: any) {
    // console.log("DATA : ", data)
    if (req.headers.env === "test") {
        return res.status(200).send(data)
    }

    let encData = await encryptedData.EncryptedData(req, res, data)
    return res.status(200).send(encData)
}

async function sendError(req: Request, res: Response, data: any) {
    return res.status(422).send(data)
}

function getCurrentUTC(format = 'YYYY-MM-DD HH:mm:ss.SSS', addMonth: any = null, addSeconds: number = 0) {
    // console.log(moment.utc(new Date()).format("YYYY-MM-DD HH:mm:ss"));
    if (addMonth != null) {
        return moment.utc(new Date()).add(addMonth, 'M').format(format);
    } else if (addSeconds > 0) {
        return moment.utc(new Date()).add(addSeconds, 'seconds').format(format);
    } else {
        return moment.utc(new Date()).add().format(format);
    }
}

function formattedErrors(err: any) {
    let transformed: any = {};
    Object.keys(err).forEach(function (key, val) {
        transformed[key] = err[key][0];
    })
    return transformed
}

function formatUserDetails(customer: User) {
    return {
        "userId": customer.id ?? 0,
        "name": customer.name?.toString() ?? "",
        "countryCode": customer.countryCode,
        "mobileNumber": customer.mobileNumber,
        "deviceToken": customer.deviceToken,
        "deviceType": customer.deviceType,
        "deviceId": customer.deviceId,
        "gender": customer.gender.valueOf(),
        "image": getImagePath(1, customer.image),
    }
}

async function formatPostDetails(post: Post) {

    return {
        ...{
            "id": post.id,
            "postUploaderUserId": post.postUploaderUserId,
            "postType": post.postType,
            "postCaption": post.postCaption,
            "postMedia": getImagePath(2, post.postMedia ?? ""),
            "postThumbnail": getImagePath(2, post.postThumbnail ?? ""),
            "likeCount": post.getDataValue("likeCount") ?? 0,
            "commentCount": post.getDataValue("commentCount") ?? 0,
            "uploaderUserName": post.uploader?.name ?? "",
            "uploaderImage": getImagePath(1, post.uploader?.image ?? ""),
        },
        ...{
            "likedUserList": await likedUserList(post.id),
            "commentedUserList": await commentedUserList(post.id)
        }
    }
}

async function likedUserList(postId: number) {
    let list = await Like.findAll({
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
    return list.map(value => {
        return {
            "postLikeUserId": value.postLikeUserId,
            "name": value.liker.name,
            "image": getImagePath(1, value.liker.image)
        }
    })
}

async function commentedUserList(postId: number) {
    let list = await Comment.findAll({
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
    return list.map(value => {
        return {
            "postCommentUserId": value.postCommentUserId,
            "name": value.commenter.name,
            "image": getImagePath(1, value.commenter.image),
            "postComment":value.postComment
        }
    })
}


function formatCommentList(comment: Comment) {
    return {
        "postId": comment.postId,
        "postComment": comment.postComment,
        "postCommentUserId": comment.postCommentUserId,
        "commenter": {
            "name": comment.commenter.name,
            "image": getImagePath(1, comment.commenter.image ?? "")
        }
    }
}

function formatPostDetail(post: Post) {
    return {
        "id": post.id,
        "postUploaderUserId": post.postUploaderUserId,
        "postType": post.postType,
        "postThumbnail": getImagePath(2, post.postMedia),
        "postCaption": post.postCaption,
        "postMedia": getImagePath(2, post.postMedia),
    }
}


function getImagePath(type: number, image: string) {

    if (image == null || image == "") return ""

    switch (type) {
        case 1:  // CUSTOMER IMAGE
            return config.get("APP_URL") + config.get("USERIMAGE") + image
        case 2 : // POST IMAGE
            return config.get("APP_URL") + config.get("USERPOST") + image
    }
}

export default {
    getCurrentUTC,
    sendSuccess,
    sendError,
    formattedErrors,
    formatUserDetails,
    getRootDir,
    getHomeDir,
    getPubDir,
    getImagePath,
    formatDate,
    formatPostDetail,
    formatPostDetails,
    formatCommentList
}
