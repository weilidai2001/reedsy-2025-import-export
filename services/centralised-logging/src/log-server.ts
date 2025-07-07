import express from 'express';

const app = express();
app.use(express.json());

app.post('/log', (req, res) => {
    console.log('Received log:', req.body);
    res.sendStatus(200);
});

app.listen(4000, () => console.log('Log server listening on port 4000'));
