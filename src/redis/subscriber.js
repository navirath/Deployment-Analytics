import client from "./client.js"

async function subscribe() {
    try {
        const value = await client.rPop("repoqueue", 0);
        // const id = value.element;
        console.log(`${value} is popped `);
    } catch (err) {
        console.log("error has occured: ", err);
        
    }
}


export default subscribe;
