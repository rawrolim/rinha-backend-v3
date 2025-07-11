import express from 'express';
import os from 'os';
import { getRedisClientConnection } from './configs/db';
import paymentsRoutes from './routes/payments.route';
import { startWorker } from './worker/worker';
import cluster from 'cluster';

const allowClusters = true
const app = express();
const port = 3000;
const hostname = os.hostname();

app.use(express.json());

app.use("/", paymentsRoutes);

if (cluster.isPrimary && allowClusters) {
    // Fork workers.
    for (let i = 0; i < os.cpus().length; i++) {
        cluster.fork();
    }
    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });
} else {
    app.listen(port, async () => {
        const redisClient = getRedisClientConnection();
        await redisClient.del("pending");
        await redisClient.del("successDefault");
        await redisClient.del("successFallback");
        startWorker();
        console.log({
            hostname,
            cpu: process.pid
        });
    });
}