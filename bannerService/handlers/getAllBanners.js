const {DynamoDBClient, ScanCommand} = require('@aws-sdk/client-dynamodb');

const dynamoDbClient = new DynamoDBClient({region: 'us-east-1'});

    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST', 
    };


exports.getAllBanners = async ()=>{
    try {
        const tableName = process.env.DYNAMO_TABLE;

        const scanCommand = new ScanCommand({
            TableName: tableName,
        });

        const {Items} = await dynamoDbClient.send(scanCommand);

        if(!Items || Items.length===0){
            return {
                statusCode: 404,
                headers: corsHeaders, 
                body: JSON.stringify({message:"No banners found"}),
            };
        }

        const banners = Items.map(item =>({
            imageUrl: item.imageUrl.S,
        }));


        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({banners}),
        };
    } catch (error) {
        return {
            statusCode:500,
            headers: corsHeaders, 
            body:JSON.stringify({error:error.message}),
        };
    }
}