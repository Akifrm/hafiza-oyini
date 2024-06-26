import { model, Schema } from "mongoose";
export default model("users", new Schema({
    ip: {
        type: String,
        required: true,
        default: '::1'
    },
    volume: {
        type: Number,
        required: true,
        default: .5
    },
    gameHardLevel: {
        type: String,
        required: true,
        default: ''
    },
    level: {
        type: Number,
        required: true,
        default: 1
    },
    levelYTH: {
        type: [Number],
        required: true,
        default: []
    },
    language: {
        type: String,
        required: true,
        default: ""
    },
    seted: {
        type: Boolean,
        required: true,
        default: false
    }
}));