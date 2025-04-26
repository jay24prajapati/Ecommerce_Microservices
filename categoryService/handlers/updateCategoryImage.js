const {DynamoDBClient, UpdateItemCommand} = require('@aws-sdk/client-dynamodb');

const dynamoDbClient = new DynamoDBClient({region:"us-east-1"});
    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST', 
    };

exports.updateCategoryImage = async (event)=>{
    try {
        const tableName = process.env.DYNAMO_TABLE
        const record = event.Records[0];
        const bucketName = record.s3.bucket.name;
        const fileName = record.s3.object.key;
        const imageUrl = `https://${bucketName}.s3.amazonaws.com/${fileName}`;

        const updateItemCommand = new UpdateItemCommand({
           TableName: tableName,
           Key:{fileName: {S: fileName}},
           UpdateExpression: "SET imageUrl = :imageUrl",
           ExpressionAttributeValues: {
            ":imageUrl": {S:imageUrl},
           },
        });
        //Excute the update command to modify the item in dynamoDB
        await dynamoDbClient.send(updateItemCommand);

        return {
            statusCode: 200,
            headers: corsHeaders, 
            body: JSON.stringify({message:"image Url updated successfully"}),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({message:error.message}),
        };
    }
}