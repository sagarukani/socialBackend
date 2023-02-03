import {AutoIncrement, Model, Column, DataType, PrimaryKey, Table} from "sequelize-typescript";
import {User} from "./users";

@Table({tableName: "comment", underscored: true, timestamps: false})
export class Comment extends Model<Comment> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id: number

    @Column(DataType.INTEGER)
    postId: number

    @Column(DataType.STRING)
    postComment: string

    @Column(DataType.INTEGER)
    postCommentUserId: number

    commenter: User
}