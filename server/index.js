import express from 'express';
import { connect } from 'mongoose';
import users from './model/users.js';
import skors from './model/skors.js';
import cors from 'cors';

const app = express();
const port = process.env.port || 3000;
const url = "mongo token";

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

app.post('/:req?/:skor?', (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const { params } = req;

    if (params.skor) {
        const skor = Number(params.skor);

        if (isNaN(skor)) return res.status(400).send('Error: Unable to retrieve the number.');

        // skors.updateOne({ ip }, { name: req.body.data, skor }, { upsert: true })
        new skors({ ip, skor, name: req.body.data }).save().then(() => {
            res.status(200).json({ status: 'ok' });
        }).catch(err => {
            res.status(500).json({ status: 'error' });
            console.log(err);
        });
    } else {
        let data = { [params.req]: req.body.data };
        let restart = {
            gameHardLevel: "",
            level: 1,
            levelYTH: []
        }
        if (!isNaN(req.body.data)) {
            for (let i = 0; i < req.body.data; i++) {
                restart.levelYTH[i] = 0;
            }
        }

        users.updateOne({ ip }, { $set: params.req == 'restart' ? restart : data }, { upsert: true }).then(() => {
            res.status(200).json({ status: 'ok' });
        }).catch(err => {
            res.status(500).json({ status: 'error' });
            console.log(err);
        })
    }
});

app.get('/:req?/:skor?', async (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const { params } = req;

    if (params.skor)
        skors.find({}).then(data => res.json({ data })); // buraya mongodb filtresi eklenebilir ama şu an için gerek duymadım
    else {
        users.findOne({ ip }).then(data => {
            let resData;
            if (typeof params.req == "undefined") resData = data;
            else resData = data[params.req];

            res.json({
                data: resData
            })
        }).catch(err => {
            res.status(500).json({ status: 'error' });
            console.log(err);
        });
    }
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
