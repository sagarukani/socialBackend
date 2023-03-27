export const AppConstants = {
    PORT: 3005,


    ACCESS_TOKEN_SECRET: 'MyApp',
    API_ROUTE_SOCKET: "/socket/api",

    API_STORAGE: "/storage",

    API_PATH_LOGIN: "/socket/api/login",
    API_PATH_VERIFY_OTP: "/socket/api/verifyOTP",
    API_PATH_RESEND_OTP: "/socket/api/resendOTP",
    API_PATH_UPDATE_PROFILE: "/socket/api/updateProfile",
    API_PATH_UPLOAD_IMAGE: "/socket/api/uploadImage",
    API_PATH_UPLOAD_POST_IMAGE: "/socket/api/uploadPostMedia",
    API_PATH_UPLOAD_POST: "/socket/api/uploadPost",
    API_PATH_LIKE: "/socket/api/likePost",
    API_PATH_POST_LIST: "/socket/api/postList",
    API_PATH_POST_COMMENT: "/socket/api/commentPost",
    API_PATH_POST_LIKE_USER_LIST: "/socket/api/likeList",
    API_PATH_POST_COMMENT_USER_LIST: "/socket/api/commentList",


    MAX_FILE_SIZE: 200 * 1000 * 1000,
    DATE_FORMAT: "yyyy-MM-DD HH:mm:ss.SSS",
    DATE_FORMAT_SHORT: "yyyy-MM-DD HH:mm:ss",

}

declare global {
    interface String {
        isExists(): boolean;

        isEmpty(): boolean;
    }

    interface Number {
        isExists(): boolean;
    }

    interface Boolean {
        isExists(): boolean;
    }


}

String.prototype.isExists = function () {
    return !(typeof (this) == 'undefined' || this == null);
}
String.prototype.isEmpty = function () {
    return (this) == "";
}

Number.prototype.isExists = function () {
    return !(typeof (this) == 'undefined' || this == null);
}

Boolean.prototype.isExists = function () {
    return !(typeof (this) == 'undefined' || this == null);
}

export enum GenderEnum {
    MALE = '1',
    FEMALE = '2'
}
