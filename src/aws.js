import AWS from 'aws-sdk';
import fs from "fs";

const s3 = new AWS.S3({
    endpoint: 'http://localhost:4566', // LocalStack S3
    s3ForcePathStyle: true,            // required for LocalStack
    accessKeyId: 'test',               // default LocalStack creds
    secretAccessKey: 'test'
});

export const uploadFile = async (fileName, localFilePath) => {
    console.log("called");
    const fileContent = fs.readFileSync(localFilePath);
    const response = await s3.upload({
        Body: fileContent,
        Bucket: "repos",
        Key: fileName,
    }).promise();

    console.log(response);  
}
