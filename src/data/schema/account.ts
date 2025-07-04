import { Model, model, Schema } from "mongoose";

const AccountSchema = new Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String
    }
})

const AccountModel = model("account", AccountSchema)

export default AccountModel;