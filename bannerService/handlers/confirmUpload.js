const {DynamoDBClient , PutItemCommand} = require('@aws-sdk/client-dynamodb');

const dynamoDbClient  = new DynamoDBClient({
    region:"us-east-1"
});

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', 
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'OPTIONS,POST', 
  };

//lambda function to confirm file uplaod and store file metadata in dynamoDb
exports.confirmUpload = async (event) =>{
  try {
    const tabelName = process.env.DYNAMO_TABLE;
    const bucketName = process.env.BUCKET_NAME;

    const record = event.Records[0]; 

    const fileName = record.s3.object.key;

    const imageUrl = `https://${bucketName}.s3.amazonaws.com/${fileName}`;

    const putItemCommand = new PutItemCommand({
        TableName: tabelName,
        Item: {
            fileName:{S: fileName},
            imageUrl:{S: imageUrl},
            uploadedAt:{S: new Date().toISOString()},
        }
    });

    await dynamoDbClient.send(putItemCommand);

    return {
        statusCode:200,
        headers: corsHeaders, 
        body: JSON.stringify({message:"File uploaded & confirmed"})
    }
  } catch (error) {
    return {
        statusCode:500,
        headers: corsHeaders, 
        body: JSON.stringify({error:error.message})
    }
  }
};