import express from "express";
import cors from "cors";
import { simpleGit } from "simple-git";
import { generate } from "./util/util.js";
import path from "path";
import { getAllFiles } from "./File Handling/file.js";
import client from "./redis/client.js";
import subscribe from "./redis/subscriber.js";
import  { uploadFile } from "./aws/aws.js";
import fs from "fs";
import { detectLanguage, generateDockerfile } from "./Resource_estimation/dockerFileGenerator.js";

const PORT = 4000;
const app = express();

app.use(cors());
app.use(express.json()); //middleware

app.post("/deploy", async (req, res) => {
    try{
    const repoUrl = req.body.repoUrl;
    console.log(repoUrl);
    const id = generate();

    const outputPath = `/output/${id}`; // ✅ Always clone into container-mapped folder
    await simpleGit().clone(repoUrl, outputPath);
    const files = getAllFiles(outputPath);
    console.log(files);

   for (const filePath of files) {
        // Remove "/output/3tzf8/" from the start to make a clean S3 key
        const key = filePath.replace('/output/', ''); // gives '3tzf8/src/App.jsx'
        console.log("Uploading:", key);
        await uploadFile(key, filePath);
    }

    console.log("All files uploaded to LocalStack S3!");
    

    await client.lPush("repoqueue", id);
    const poppedId = await subscribe();
    console.log(`id popped: ${poppedId}`);
    
    console.log()
    const lang = detectLanguage(`./oRutput/${poppedId}`);
    console.log(`Language detected: ${lang}`);
    
    await generateDockerfile(`./output/${poppedId}`);
    
    res.json({
        id: id
    });
} catch(err) {
    console.log("Deploy error : ", err);
    res.status(500).json({ error: err.message})
}
});
app.listen(PORT, () => { console.log("app is listening on the port ", PORT); });