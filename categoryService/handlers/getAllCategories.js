const {DynamoDBClient, ScanCommand} = require('@aws-sdk/client-dynamodb');

const dynamoDbClient = new DynamoDBClient({region:"us-east-1"});

    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST', 
    };

//Lambda function to get all categories from Dynamodb
exports.getAllCategories = async () =>{
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
                body: JSON.stringify({message:"No Categories found"}),
            };
        }
        
        const categories = Items.map(item =>({
           categoryName: item.categoryName.S,
           imageUrl: item.imageUrl.S,
        }));

        return {
            statusCode: 200,
            headers: corsHeaders, 
            body: JSON.stringify(categories),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: corsHeaders, 
            body: JSON.stringify({error: error.message}),
        };
    }
};