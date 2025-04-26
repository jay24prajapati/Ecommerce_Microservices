const {DynamoDBClient, UpdateItemCommand, ScanCommand} = require('@aws-sdk/client-dynamodb');

const dynamoDbClient = new DynamoDBClient({region:"us-east-1"});
    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST', 
    };

exports.updateProductImage = async (event)=>{
    try {
        const tableName = process.env.DYNAMO_TABLE 
        const record = event.Records[0];   
        const bucketName = record.s3.bucket.name;   
        const fileName = record.s3.object.key;      
        const imageUrl = `https://${bucketName}.s3.amazonaws.com/${fileName}`;

         //Fine the ID using fileName
         const scanCommand = new ScanCommand({
            TableName: tableName,
            FilterExpression: "fileName = :fileName",
            ExpressionAttributeValues: {
                ":fileName": {S: fileName}
            }
         });

        const scanResult = await dynamoDbClient.send(scanCommand);
        if(!scanResult.Items || scanResult.Items.length ===0){
            return {
                statusCode: 404,
                headers: corsHeaders, 
                body: JSON.stringify({message:"Product not found"}),
            };
        }

        const productId = scanResult.Items[0].id.S; 
       
        const updateItemCommand = new UpdateItemCommand({
           TableName: tableName,
           Key:{id: {S: productId}},
           UpdateExpression: "SET imageUrl = :imageUrl",
           ExpressionAttributeValues: {
            ":imageUrl": {S:imageUrl},
           },
        });
        
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