import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { config } from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set } from "firebase/database";
import signTransaction from './sign.js';

config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const initApp = initializeApp(JSON.parse(process.env.FIREBASE_CONFIG));
const database = getDatabase(initApp);

const DATA = {};

function updateCurrentCount() {
    const count = ref(database, "ConfessClout/count");
    onValue(count, (snapshot) => {
        DATA['currentCount'] = snapshot.val();
    });
}
updateCurrentCount();

function incrementCurrentCount() {
    updateCurrentCount();
    set(ref(database, "ConfessClout/count"), DATA['currentCount'] + 1);
}

async function sendPost(body, quoteHex = "") {
    var endpoint, payload, res;
    const ROUTE = "https://bitclout.com/api/v0/";
    body = body.replace(new RegExp("@", "g"), "@ ");
    payload = {
        UpdaterPublicKeyBase58Check: process.env.PUBKEY,
        BodyObj: { Body: body, ImageURLs: [] },
        RecloutedPostHashHex: quoteHex,
        IsHidden: false,
        MinFeeRateNanosPerKB: 1000
    };
    endpoint = ROUTE + "submit-post";
    res = await axios.post(endpoint, payload)
        .then((res) => { if (res.status === 200) { return res.data } });
    const signedTxnHex = signTransaction(process.env.SEEDHEX, res.TransactionHex);
    endpoint = ROUTE + "submit-transaction";
    payload = { TransactionHex: signedTxnHex };
    res = await axios.post(endpoint, payload)
        .then((res) => { if (res.status === 200) { return res.data } });
    const URL = "https://bitclout.com/posts/" + res.TxnHashHex
    return URL;
}

app.use(bodyParser.json());

const keys = [];

app.post("/setPublicKey", (request, response) => {
    const { publicKey } = request.body;
    if (keys.indexOf(publicKey) === -1) {
        keys.push(publicKey);
        // console.log(`${publicKey} logged in`);
        console.log("Someone logged in");
        response.send({ status: 200 });
    }
});

app.post("/postConfession", (request, response) => {
    const { confession } = request.body;
    const { publicKey } = request.body;
    if (keys.indexOf(publicKey) >= 0) {
        const pos = keys.indexOf(publicKey);
        keys.splice(pos, 1);
        console.log("Someone made a confession");
        updateCurrentCount();
        const body = `Confession #${DATA['currentCount']}\n⸻⸻⸻⸻⸻\n${confession}`;
        sendPost(body)
            .then((u) => {
                const count = DATA['currentCount'];
                incrementCurrentCount();
                response.send({ postUrl: u, count: count });
            });
    }
});

// static files (build of your frontend)
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(join(__dirname, 'frontend', 'build')));
    app.get('/*', (req, res) => {
        res.sendFile(join(__dirname, 'frontend', 'build', 'index.html'));
    })
}


const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
