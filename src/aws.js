import AWS from 'aws-sdk';
import fs from "fs";

// Configure AWS SDK to use LocalStack
const s3 = new AWS.S3({
  endpoint: 'http://localstack:4566',  // LocalStack S3 endpoint
  s3ForcePathStyle: true,              // required for LocalStack
  accessKeyId: 'test',                 // default LocalStack creds
  secretAccessKey: 'test',
  region: 'us-east-1'                  // specify region
});

// Function to upload file
export const uploadFile = async (fileName, localFilePath) => {
  try {
    console.log("Uploading file to LocalStack S3...");

    // Read file
    const fileContent = fs.readFileSync(localFilePath);

    // Ensure bucket exists before upload
    const bucketName = "repos";
    try {
      await s3.headBucket({ Bucket: bucketName }).promise();
    } catch (err) {
      if (err.statusCode === 404) {
        await s3.createBucket({ Bucket: bucketName }).promise();
        console.log(`Bucket "${bucketName}" created.`);
      } else {
        throw err;
      }
    }

    // Upload file
    const response = await s3.upload({
      Bucket: bucketName,
      Key: fileName,
      Body: fileContent
    }).promise();

    console.log("File uploaded successfully:", response);
    return response;

  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};
