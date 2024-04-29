<<<<<<< HEAD
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
        default: [0, 0, 0, 0, 0]
    }
=======
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
    language: {
        type: String,
        required: true,
        default: 'tr'
    },
    hardLevel: {
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
        type: [Object],
        required: true,
        default: [
            { level: 1, yth: 0, },
            { level: 2, yth: 0, },
            { level: 3, yth: 0, },
            { level: 4, yth: 0, },
            { level: 5, yth: 0, },
        ]
    }
>>>>>>> d8eb13a8315af6d83cfaeeae243848d164051acd
}));