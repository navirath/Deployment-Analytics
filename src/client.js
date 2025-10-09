import { createClient } from 'redis';

const client = createClient({
  url: 'redis://redis-stack:6379'
 // default Redis port

});

client.on('error', (err) => console.log('Redis Client Error', err));

await client.connect();

console.log('Connected to Redis!');

export default client;