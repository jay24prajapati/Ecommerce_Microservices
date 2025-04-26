const {S3Client, PutObjectCommand} = require('@aws-sdk/client-s3')
const {getSignedUrl} = require('@aws-sdk/s3-request-presigner');
const {DynamoDBClient, PutItemCommand} = require('@aws-sdk/client-dynamodb');

const s3Client = new S3Client({region: "us-east-1"});
const dyanamoDbClient = new DynamoDBClient({region:"us-east-1"});

    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST',
    };
    
//Lambda function to generate a pre-signed URl for S3 file  upload
exports.getUploadUrl = async (event) =>{
    try {
        const bucketName = process.env.BUCKET_NAME;
        const {fileName, fileType,categoryName} = JSON.parse(event.body);

        if(!fileName || !fileType || !categoryName){
            return{
                statusCode: 400,
                headers: corsHeaders, 
                body: JSON.stringify({error:"fileName , fileType and categoryName are required"}),
            };
        }

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: fileName,
            ContentType: fileType,
        });

        const signedUrl = await getSignedUrl(s3Client, command,{expiresIn:3600});
        
        const putItemCommand = new PutItemCommand({
            TableName: process.env.DYNAMO_TABLE,
            Item:{
                fileName:{S:fileName},
                categoryName:{S: categoryName},
                createdAt: {S:new Date().toISOString()},
            }
        });

        await dyanamoDbClient.send(putItemCommand);

        return{
            statusCode:200,
            headers: corsHeaders,
            body:JSON.stringify({uploadUrl:signedUrl}),
        };
     
    } catch (error) {
        return{
            statusCode:500,
            headers: corsHeaders,
            body:JSON.stringify({error:error.message}),
        };
    }
}