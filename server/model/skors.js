import { model, Schema } from "mongoose";
export default model("skors", new Schema({
    ip: {
        type: String,
        required: true,
        default: '::1'
    },
    name: {
        type: String,
        reqiured: true
    },
    skor: {
        type: Number,
        required: true
    }
}));