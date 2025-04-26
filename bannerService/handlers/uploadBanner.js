//Interact with S3 and generate pre-signed URLs
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client({ region: "us-east-1" });

    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST',
    };

//Lambda function to generate a pre-signed URL for S3 file upload
exports.getUploadUrl = async (event) => {
    try {
        const bucketNAME = process.env.BUCKET_NAME;

        const {fileName, fileType } = JSON.parse(event.body);

        if (!fileName || !fileType) {
            return {
                statusCode: 400,
                headers: corsHeaders, 
                body: JSON.stringify({ error: "fileName and fileType are required" }),
            };
        }

        const command = new PutObjectCommand({
            Bucket: bucketNAME,
            Key: fileName,
            ContentType: fileType,
        });

        //Generating pre-signed url that expires in 3600 seconds = 1 hr
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        return {
            statusCode: 200,
            headers: corsHeaders, 
            body: JSON.stringify({ uploadURL: signedUrl }),
        };


    } catch (error) {
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error:error.message }),
        };
    }
}
