import { createClient } from "redis";

function getRedisClientConnection() {
    const redisClient = createClient({ url: 'redis://database:6379' });
    redisClient.on('error', (err) => console.log('Redis Client Error', err));
    redisClient.connect();
    return redisClient;
}

// Function to set a key-value pair in Redis
export async function setValue(key: string, value: string): Promise<void> {
    const redisClient = getRedisClientConnection();
    await redisClient.set(key, value);
    await redisClient.quit();
};

// Function to retrieve a value by key from Redis
export async function getValue(key: string): Promise<string | null> {
    const redisClient = getRedisClientConnection()
    return redisClient.get(key);
};