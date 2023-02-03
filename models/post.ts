import {AutoIncrement, Column, DataType, Model, PrimaryKey, Table} from "sequelize-typescript";
import {User} from "./users";

@Table({tableName: "post", underscored: true, timestamps: false})
export class Post extends Model<Post> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id: number

    @Column(DataType.INTEGER)
    postUploaderUserId: number

    @Column(DataType.INTEGER)
    postType: number // 1 for image and 2 for video

    @Column(DataType.STRING)
    postCaption: string

    @Column(DataType.STRING)
    postMedia: string

    @Column(DataType.STRING)
    postThumbnail: string

    likeCount: number
    commentCount: number
    uploader: User
}