import express from "express";
import cors from "cors";
import { simpleGit } from "simple-git";
import { generate } from "./util.js";
import path from "path";
import { getAllFiles } from "./file.js";
// import { createClient } from "redis";
import client from "./client.js";

// const publisher = createClient();
// publisher.connect();

const PORT = 4000;
const app = express();

app.use(cors());
app.use(express.json()); //middleware

app.post("/deploy", async (req, res) => {
    try{
    const repoUrl = req.body.repoUrl;
    console.log(repoUrl);
    const id = generate();
    await simpleGit().clone(repoUrl,  `../output/${id}`);
    await simpleGit().clone(repoUrl,  `/app/output/${id}`);

    await client.lPush("repoqueue", id);

    const files = getAllFiles( `../output/${id}`);

    // publisher.lPush("build-queue", id);    

        // await client.lpush("build-queue", id);
        // console.log(`${id} added to the queue build-queue`);   
    
    res.json({
        id: id
    });
} catch(err) {
    console.log("Deploy error : ", err);
    res.status(500).json({ error: err.message})
}
});
app.listen(PORT, () => { console.log("app is listening on the port ", PORT); });
//# sourceMappingURL=index.js.map