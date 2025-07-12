import Redis from "ioredis";

export function getRedisClientConnection() {
    const redisClient = new Redis({'host':'database', port: 6379});
    redisClient.on('error', (err) => console.log('Redis Client Error', err));
    return redisClient;
}

export async function initDatabase(){
    const redisClient = getRedisClientConnection();
    await redisClient.del("pending");
    await redisClient.del("successDefault");
    await redisClient.del("successFallback");
}

// Function to set a key-value pair in Redis
export async function addToQueue(key: string, value: any): Promise<void> {
    const redisClient = getRedisClientConnection();
    await redisClient.lpush(key, JSON.stringify(value));
    await redisClient.quit();
};

// Function to retrieve a value by key from Redis
export async function removeToQueue(key: string){
    const redisClient = getRedisClientConnection()
    const data = await redisClient.brpop(key,0);
    if(data){
        const value = JSON.parse(data[1]);
        return value;
    }
    return null
};

export async function getValue(key:string){
    const redisClient = getRedisClientConnection()
    const items = await redisClient.lrange(key, 0, -1);
    const parsedItems = items.map(item => JSON.parse(item));
    return parsedItems
}