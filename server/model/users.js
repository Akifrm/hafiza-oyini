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
}));