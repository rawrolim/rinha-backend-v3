import express from 'express';
import os from 'os';
import { getValue, setValue } from './configs/db';
import paymentsRoutes from './routes/payments.route';

const app = express();
const port = 3000;
const hostname = os.hostname();

app.use(express.json());

app.use("/",paymentsRoutes);

app.get('/', async (req, res) => {
    const response = await fetch(process.env.PAYMENT_PROCESSOR_URL_DEFAULT+'/payments/service-health');
    const data = await response.json();
    await setValue('health',JSON.stringify(data));

    const dataRedis = getValue('health');

    console.log(dataRedis)
    res.send({
        message: 'Acesso a API node',
        instance: hostname,
        helthCheckApi: dataRedis
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
