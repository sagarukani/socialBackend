import {FCMData} from "../models/fcmdata";



export class FCMHelper {
    private static instance: FCMHelper;
    private readonly admin = require("firebase-admin");

    /**
     * The Singleton's constructor should always be private to prevent direct
     * construction calls with the `new` operator.
     */
    private constructor() {


        // let serviceAccount = data;
        try {
            this.admin.initializeApp({
                credential: this.admin.credential.cert({}
                )
            });
        } catch (e) {
        }


    }

    /**
     * The static method that controls the access to the singleton instance.
     *
     * This implementation let you subclass the Singleton class while keeping
     * just one instance of each subclass around.
     */
    public static getInstance(): FCMHelper {
        if (!FCMHelper.instance) {
            FCMHelper.instance = new FCMHelper();
        }

        return FCMHelper.instance;
    }

    public async test() {
        await this.admin.messaging().send({
            data: {
                score: '850',
                time: '2:45'
            },
            notification: {
                title: "Hiii",
                body: "hello",
            },
            token: "fhyh2NKaLkcuvGQCQ-PCo_:APA91bHGDggUas1hMBpZXufbkgGzPWqDlWSYIDGKk51KFNgbdjg6x5vDXVtHiHXdjWXN3z3b5LXmIhU5-kNpx0_QVkXynrhM4MurwJrKf52zibRsR55_f8oq-Vkgsv0f8L7Ykt-JeuCT"
        }).then((value: any) => {
            console.log('Successfully sent message:', value);
        }).catch((error: any) => {
            console.log('Error sending message:', error);
        })
    }





    public async sendNotificationA(data: any, fcmReceiver: any) {

        let message = {
            data: data,
            token: fcmReceiver?.deviceToken
        }

        try {
            await this.admin.messaging().send(message).then((value: any) => {
                console.log('Successfully sent message:', value);
            }).catch((error: any) => {
                console.log('Error sending message:', error?.errorInfo);
                throw error
            })
        } catch (e: any) {
            console.log('Error sending message:', e.message);
        }
    }


    public async sendNotification(fcmData: FCMData, fcmReceiver: any, type: string, messageObj: any) {

        delete messageObj.id
        let sender = {
            "id": fcmData.data.sender?.id.toString(),
            "username": fcmData.data.sender?.username ?? "",
            "profile": fcmData.data.sender?.profile ?? ""
        }

        let params = JSON.stringify({
            ...sender,
            ...messageObj,
            ...{
                "type": type,
            }
        })

        let data = {
            "title": fcmData.data.title,
            "message": fcmData.data.message,
            "data": params,
            "updatedAt": fcmData.data.updatedAt,
            "type": type,
        }

        // console.log("RECEIVER " , data)

        let message = fcmReceiver?.deviceType == 1 ?
            {
                data: data,
                notification: {
                    title: fcmData.subject,
                    body: fcmData.content,
                },
                apns: {
                    payload: {
                        aps: {
                            alert: {
                                title: fcmData.subject,
                                body: fcmData.content,
                            },
                            sound: type == "6" ? 'Iphone_Ringtone.mp3' : "default"
                        }
                    }
                },
                token: fcmReceiver?.deviceToken
            } : {
                data: data,
                token: fcmReceiver?.deviceToken
            }

        await this.admin.messaging().send(message).then((value: any) => {
            console.log('Successfully sent message:', value);
        }).catch((error: any) => {
            console.log('Error sending message:', error);
            throw error
        })
    }

    public async sendNotificationWithTag(fcmData: FCMData, fcmReceiver: any, type: string, messageObj: any, tag: string) {

        delete messageObj.id
        let sender = {
            "id": fcmData.data.sender?.id.toString(),
            "username": fcmData.data.sender?.username ?? "",
            "profile": fcmData.data.sender?.profile ?? ""
        }

        let params = JSON.stringify({
            ...sender,
            ...messageObj,
            ...{
                "type": type,
            }
        })

        let data = {
            "title": fcmData.data.title,
            "message": fcmData.data.message,
            "data": params,
            "updatedAt": fcmData.data.updatedAt,
            "type": type,
        }

        // console.log("RECEIVER " , data)

        let message = fcmReceiver?.device_type == 2 ?
            {
                data: data,
                notification: {
                    title: fcmData.subject,
                    body: fcmData.content,
                },
                apns: {
                    payload: {
                        aps: {
                            alert: {
                                title: fcmData.subject,
                                body: fcmData.content,
                            },
                            sound: type == "6" ? 'Iphone_Ringtone.mp3' : "default"
                        }
                    }
                },
                token: fcmReceiver?.deviceToken
            } : {
                data: data,
                token: fcmReceiver?.deviceToken,
                android: {
                    notification: {
                        tag: tag
                    }
                }
            }

        await this.admin.messaging().send(message).then((value: any) => {
            console.log('Successfully sent message:', value);
        }).catch((error: any) => {
            console.log('Error sending message:', error);
            throw error
        })
    }

    public async sendSilentNotification(fcmToken: String) {

        let data = {
            "update_chips": "true"
        }

        await this.admin.messaging().send({
            data: data,
            token: fcmToken,
            apns: {
                payload: {
                    aps: {
                        contentAvailable: true
                    }
                }
            }
        }).then((value: any) => {
            console.log('Successfully sent message:', value);
        }).catch((error: any) => {
            console.log('Error sending message:', error);
            throw error
        })
    }
}