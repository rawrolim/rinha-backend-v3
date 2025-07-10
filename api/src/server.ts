
import express from 'express';
import os from 'os';

const app = express();
const port = 3000;
const hostname = os.hostname();

app.use(express.json());

app.get('/', (req, res) => {
    res.send({
        message: 'Acesso a API node',
        instance: hostname
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
