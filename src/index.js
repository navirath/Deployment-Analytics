import express from "express";
import cors from "cors";
import { simpleGit } from "simple-git";
import { generate } from "./util.js";
import path from "path";
import { getAllFiles } from "./file.js";
import client from "./client.js";
import subscribe from "./subscriber.js";
import  { uploadFile } from "./aws.js";
import fs from "fs";

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

    console.log("files : ");
    for (const file of files) {
        console.log(file);
    }

   for (const filePath of files) {
        // Remove "/output/3tzf8/" from the start to make a clean S3 key
        const key = filePath.replace('/output/', ''); // gives '3tzf8/src/App.jsx'
        console.log("Uploading:", key);
        await uploadFile(key, filePath);
    }

    console.log("All files uploaded to LocalStack S3!");


    await client.lPush("repoqueue", id);
    subscribe();
    
    res.json({
        id: id
    });
} catch(err) {
    console.log("Deploy error : ", err);
    res.status(500).json({ error: err.message})
}
});
app.listen(PORT, () => { console.log("app is listening on the port ", PORT); });