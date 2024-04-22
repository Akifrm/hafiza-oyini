import { model, Schema } from "mongoose";
export default model("users", new Schema({
    ip: {
        type: String,
        required: true
    },
    volume: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true
    },
    level: {
        type: String,
        required: true
    }
}));