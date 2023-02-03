import express, {Application} from "express";

import {AppConstants} from "../utils/appconstants";
import validationMiddleware from "../middleware/validations";
import apiController from "../controllers/ApiController";


let Router = express.Router()

// User Details
Router.route(AppConstants.API_PATH_LOGIN).post(validationMiddleware.loginValidation, apiController.login)
Router.route(AppConstants.API_PATH_VERIFY_OTP).post(validationMiddleware.verifyOTPValidation, apiController.verifyOTP)
Router.route(AppConstants.API_PATH_RESEND_OTP).post(validationMiddleware.resendOTPValidation, apiController.resendOTP)
Router.route(AppConstants.API_PATH_UPDATE_PROFILE).post(apiController.updateProfile)
Router.route(AppConstants.API_PATH_UPLOAD_IMAGE).post(apiController.uploadImage)
Router.route(AppConstants.API_PATH_UPLOAD_POST_IMAGE).post(apiController.uploadPostMedia)
Router.route(AppConstants.API_PATH_UPLOAD_POST).post(validationMiddleware.postValidation, apiController.uploadPost)
Router.route(AppConstants.API_PATH_LIKE).post(apiController.likePost)
Router.route(AppConstants.API_PATH_POST_LIST).get(apiController.postList)
Router.route(AppConstants.API_PATH_POST_COMMENT).post(apiController.commentPost)
Router.route(AppConstants.API_PATH_POST_LIKE_USER_LIST).get(apiController.likeList)
Router.route(AppConstants.API_PATH_POST_COMMENT_USER_LIST).get(apiController.commentList)
Router.route("/socket/api/demo").post(apiController.demo)


export {Router}
