import {PrimaryKey, Table, Model, AutoIncrement, Column, DataType} from "sequelize-typescript";
import {User} from "./users";

@Table({tableName: "likes", underscored: true, timestamps: false})
export class Like extends Model<Like> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id: number

    @Column(DataType.INTEGER)
    postId: number


    @Column(DataType.INTEGER)
    postLikeUserId: number

    liker: User
    name:string
}