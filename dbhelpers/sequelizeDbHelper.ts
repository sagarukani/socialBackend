import {Sequelize} from "sequelize-typescript";
import {User} from "../models/users";

const config = require("config")

export class SequelizeDbHelper {
    private static instance: SequelizeDbHelper
    private readonly sequelize: Sequelize

    /**
     * The Singleton's constructor should always be private to prevent direct
     * construction calls with the `new` operator.
     */
    private constructor() {
        this.sequelize = new Sequelize({
            // Memory
            /*
            host: 'localhost',
            database: "massttr",
            dialect: "sqlite",
            storage: ":memory:",
            */

            //Local
            dialect: 'mysql',
            host: 'localhost',
            port: 3306,
            username: config.get("DB_USERNAME"),
            password: config.get("DB_PASSWORD"),
            database: config.get("DB_DATABASE"),
            logging: config.get("DB_LOGGING"),
            pool: {
                max: 10,
                min: 0,
                acquire: 100 * 1000,
                idle: 10000
            }

            //Live - elaunch
            // dialect: 'mysql',
            // host: 'localhost',
            // port: 3306,
            // username: 'root',
            // password: '',
            // database: 'tung',
            // logging: true

            // Live - client
            // dialect: 'mysql',
            // host: 'localhost',
            // port: 3306,
            // username: 'root',
            // password: '',
            // database: 'tung',
            // logging: true

        });

    }

    async getResUserById(userId: number, to: number): Promise<User> {
        return (await User.findOne({
            where: {id: userId}, attributes: ['id', 'name', 'image', 'countryCode', 'mobileNumber',
                [Sequelize.literal(`(SELECT name
                                                       FROM contacts AS cont
                                                       WHERE cont.login_id = ${to}
                                                         AND cont.contact_id = ${userId} LIMIT 1)`), "contactName"],
            ]
        })) ?? null
    }


    async getFcmReceiverByUserId(userId: number, chatId: string): Promise<User> {
        return (await User.findOne({
            where: {id: userId},
            attributes: ['id', 'deviceToken', 'deviceType', 'voipToken',
                [Sequelize.literal(`(SELECT is_mute AS isMute FROM conversations AS conversation WHERE conversation.chat_id = '${chatId}' AND conversation.login_id = ${userId})`), 'isMute']
            ]
        }))
    }


    /**
     * The static method that controls the access to the singleton instance.
     *
     * This implementation let you subclass the Singleton class while keeping
     * just one instance of each subclass around.
     */
    public static getInstance(): SequelizeDbHelper {
        if (!SequelizeDbHelper.instance) {
            SequelizeDbHelper.instance = new SequelizeDbHelper();
        }

        return SequelizeDbHelper.instance;
    }

    public getSequelizeClint() {
        return this.sequelize
    }

}