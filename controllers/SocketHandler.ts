import {Socket} from "socket.io";
import {SequelizeDbHelper} from "../dbhelpers/sequelizeDbHelper";


let sequelizeDbHelper = SequelizeDbHelper.getInstance()


async function chatHandler(client: Socket) {
    let userId = client.handshake.query['userId']?.toString() ?? "0"
    let token = client.handshake.query['token']?.toString() ?? ""

    let clientId = client.id
    console.log("QUERY : ", client.handshake.query, `: ${client.id}`)



}


export default {
    chatHandler,
}