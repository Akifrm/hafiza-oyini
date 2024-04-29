import express from 'express';
import { connect } from 'mongoose';
import users from './model/users.js';
import cors from 'cors';

const app = express();
const port = process.env.port || 3000;
const url = "mongodb+srv://akifcagliworkforweb:saergkweprgwergwerg5864we5rg41w6erg@cluster0.h75cbbf.mongodb.net/Cluster1?retryWrites=true&w=majority";

connect(url).then(() => {
    console.log("MongoDB'ye başarıyla bağlanıldı");
})

app.use(cors({
    origin: ['http://127.0.0.1:5500'],
    credentials: true,
    optionSuccessStatus: 200
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/:req', (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const { params } = req;

    let data = { [params.req]: req.body.data };
    let restart = {
        gameHardLevel: "",
        level: 1,
        levelYTH: [0]
    }
    users.updateOne({ ip }, { $set: params.req == 'restart' ? restart : data }, { upsert: true }).then(() => {
        res.status(200).json({ status: 'ok' });
    }).catch(err => {
        res.status(500).json({ status: 'error' });
        console.log(err);
    })
});

app.get('/:req', async (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const { params } = req;

    users.findOne({ ip }).then(data => {
        res.json({
            data: data[params.req]
        })
    }).catch(err => {
        res.status(500).json({ status: 'error' });
        console.log(err);
    })
});

app.get('/', (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    users.findOne({ ip }).then(data => {
        res.json({ data })
    }).catch(err => {
        res.status(500).json({ status: 'error' });
        console.log(err);
    })
});

app.listen(port, () => {
    console.log(`Sunucu ${port} numaralı port üzerinde çalışıyor`);
});