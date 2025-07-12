import express from 'express';
import os from 'os';
import { initDatabase } from './configs/db';
import paymentsRoutes from './routes/payments.route';
import { startWorker, updateHealthCheck } from './worker/worker';
import cluster from 'cluster';

const allowClusters = true
const app = express();
const port = 3000;
const hostname = os.hostname();

app.use(express.json());

app.use("/", paymentsRoutes);

if (cluster.isPrimary && allowClusters) {
    initDatabase(); 
    updateHealthCheck();

    console.log(`Criando clusters de processadores. Processadores: ${os.cpus().length}`);
    for (let i = 0; i < os.cpus().length-1; i++) {
        cluster.fork();
    }
    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });
} else {
    app.listen(port, async () => {
        startWorker();
        console.log({
            hostname,
            cpu: process.pid
        });
    });
}