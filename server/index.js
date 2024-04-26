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

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.post('/:req', (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const { params } = req;

    console.log(params.req, req.body, params)
    users.updateOne({ ip }, { [params.req]: req.body.data }, { upsert: true }).then(() => {
        res.status(200).json({ status: 'ok' });
    }).catch(err => {
        res.status(500).json({ status: 'error' });
        console.log(err);
    })
});

app.listen(port, () => {
    console.log(`Sunucu ${port} numaralı port üzerinde çalışıyor`);
});