const {DynamoDBClient, UpdateItemCommand} = require('@aws-sdk/client-dynamodb');
const {sendOrderEmail} = require('../services/sendEmail');
const client = new DynamoDBClient({region:"us-east-1"});

    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST',
    };

exports.handler = async (event)=>{
    try {
       const {id, email, quantity, product} = event;
       
       await client.send(
        new UpdateItemCommand({
            TableName: process.env.DYNAMO_TABLE,
            Key:{
                id: {S: id},
            },
            UpdateExpression: "set #s = :newStatus",
            ExpressionAttributeNames:{
                "#s": "status",
            },
            ExpressionAttributeValues:{
                ":newStatus": {S: "shipping"},
            },
        })
       );
        
        //Send order confirmation email to the user using AWS SES
        await sendOrderEmail(
            email,
            id,
            product.productName?.S || "Unknown Product",
            quantity,
            `${product.productName?.S} now shipping`
        );

       return {
        statusCode: 200,
        headers: corsHeaders, 
        body: JSON.stringify({message: `Order ${id} status updated to processing`}),
       };
    } catch (error) {
        return {
            statusCode: 500,
            headers: corsHeaders, 
            body: JSON.stringify({error:  error.message}),
           };
    }
};