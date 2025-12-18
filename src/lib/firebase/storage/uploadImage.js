'use server'
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    signatureVersion: 'v4',
});

export async function uploadImageToS3(buffer, originalFileName, contentType, folderName) {

    const key = `${folderName}/${uuidv4()}-${originalFileName}`;
    
    console.log(process.env.AWS_S3_BUCKET_NAME);
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType
    };

    

    await s3.upload(params).promise();

    return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}


export const deleteImageFromS3 = async (url) => {
    try {
        if (!url.includes(".com/")) throw new Error("Invalid S3 URL");

        const key = url.split(".com/")[1]; // Get key after domain

        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME, // ✅ secure
            Key: key,
        };

        await s3.deleteObject(params).promise();
        console.log(`✅ Deleted image from S3: ${key}`);
    } catch (err) {
        console.error("❌ Failed to delete image from S3:", err);
        throw err;
    }
};