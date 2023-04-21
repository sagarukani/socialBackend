import {AutoIncrement, Column, DataType, Model, PrimaryKey, Table} from 'sequelize-typescript'
import {GenderEnum} from "../utils/appconstants";

@Table({tableName: "users", underscored: true, timestamps: false})
export class User extends Model<User> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id: number

    @Column(DataType.TEXT)
    email: string

    @Column(DataType.TEXT)
    name: string

    @Column(DataType.TEXT)
    countryCode: string

    @Column(DataType.TEXT)
    mobileNumber: string

    @Column(DataType.INTEGER)
    otp: number

    @Column(DataType.INTEGER)
    isVerified: number

    @Column(DataType.TEXT)
    deviceId: string

    @Column(DataType.INTEGER)
    userType : string
    //1 : normal, 2 : artist

    @Column(DataType.STRING)
    password : string

    @Column(DataType.TINYINT)
    deviceType: number

    @Column(DataType.TEXT)
    deviceToken: string


    @Column(DataType.TEXT)
    image: string

    @Column(DataType.TEXT)
    authToken: string

    @Column(DataType.DATE)
    created_at: Date | any

    @Column(DataType.DATE)
    updated_at: Date | any

    @Column(DataType.DATE)
    dob: Date | any

    @Column(DataType.INTEGER)
    gender: number

}