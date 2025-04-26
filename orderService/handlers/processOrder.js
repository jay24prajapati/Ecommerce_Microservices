const {DynamoDBClient, PutItemCommand} = require('@aws-sdk/client-dynamodb');

const dynamoDbClient = new DynamoDBClient({region:"us-east-1"});

    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST', 
    };
    
//Lambda funcion to process orders from SQS
exports.processOrder = async (event) =>{
    try {
           for(const record of event.Records){
            const orderData = JSON.parse(record.body);
            const {id, productId, quantity, email, status, createdAt} = orderData;

            //send command to DynamoDb to insert the order item
            await dynamoDbClient.send(new PutItemCommand({
                TableName: process.env.DYNAMO_TABLE,
                Item: {
                    id: {S:id},
                    productId: {S:productId},
                    quantity: {N: quantity.toString()},
                    email: {S:email},
                    status: {S:status},
                    createdAt: {S:createdAt},
   }

            }));
           }

           return {
            statusCode: 200,
            headers: corsHeaders, 
            body: JSON.stringify({message:" Order(s) processed succesfully"}),
           };
    } catch (error) {
        return {
            statusCode: 500,
            headers: corsHeaders, 
            body: JSON.stringify({error:error.message}),
           };
    }
}