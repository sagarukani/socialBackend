export class FCMData {
    subject: string
    content: string
    data: ResNotification
    image: string
}


export class ResNotification {
    title : string
    message : string
    updatedAt : string
    sender : ResSender
}

export class ResSender {
    username : string
    profile : string
    id : number
}