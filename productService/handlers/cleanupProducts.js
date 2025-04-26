const {DynamoDBClient, ScanCommand, DeleteItemCommand} = require('@aws-sdk/client-dynamodb');
const {SNSClient, PublishCommand} = require('@aws-sdk/client-sns');

const dynamoDbClient  = new DynamoDBClient({region:"us-east-1"});
const snsClient = new SNSClient({region:'us-east-1'});

    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST', 
    };

//Define the clean up function to remove outdated products 
exports.cleanupProducts = async () =>{
    try {
        const tableName = process.env.DYNAMO_TABLE;
        const snsTopicArn = process.env.SNS_TOPIC_ARN;
        const oneHourAgo = new Date(Date.now() -300 *60*1000).toISOString();
        // const oneHourAgo = new Date(Date.now() - 3 * 60 * 1000).toISOString(); // 3 minutes

        const scanCommand = new ScanCommand({
            TableName: tableName,
            FilterExpression: "createdAt < :oneHourAgo AND attribute_not_exists(imageUrl)",
            ExpressionAttributeValues:{
                ":oneHourAgo": {S: oneHourAgo}
            } 
        });

        const {Items} = await dynamoDbClient.send(scanCommand);

        if(!Items || Items.length===0){
            return {
                statusCode:200,
                headers: corsHeaders, 
                body: JSON.stringify({message: "No products found for cleanup"}),
            };
        }

        let deletedCount = 0;

        //Iterate over each outdated category and delete it from the database
        for(const item of Items){
            const deleteCommand = new DeleteItemCommand({
                TableName: tableName,
                Key: {id: {S: item.id.S}}//Delete using  the primary key
            });
            await dynamoDbClient.send(deleteCommand);
            deletedCount++; 
        }
        
    
        //send an SNS noticafication after deleting products
        const snsMessage =  `Cleanup completed. Deleted ${deletedCount} outdated products`;
     
        await snsClient.send(
            new PublishCommand({
                TopicArn: snsTopicArn,
                Message: snsMessage,
                Subject: "Product cleanup Notification",
            })
        );

        return {
            statusCode:200,
            headers: corsHeaders, 
            body: JSON.stringify({message: "Clean up completed", deletedCount}),
        };
    } catch (error) {
        return {
            statusCode:500,
            headers: corsHeaders, 
            body: JSON.stringify({error:error.message}),
        };
    }
}