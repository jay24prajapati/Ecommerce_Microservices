const {DynamoDBClient, ScanCommand} = require('@aws-sdk/client-dynamodb');
const dynamoDbClient = new DynamoDBClient({region:'us-east-1'});

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', 
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'OPTIONS,POST',
  };

//Function to fetch all products where isApproved is true
exports.getApprovedProducts = async () =>{
    try {
        const tableName = process.env. DYNAMO_TABLE;

        const scanCommand = new ScanCommand({
            TableName: tableName,
            FilterExpression: "isApproved = :trueVal",
            ExpressionAttributeValues: {
                ":trueVal": {BOOL: true}
            }
        });

      const {Items} =  await dynamoDbClient.send(scanCommand);

      return {
        statusCode:200,
        headers: corsHeaders,
        body: JSON.stringify({products:Items || []}),
      };
    } catch (error) {
        return {
            statusCode:500,
            headers: corsHeaders,
            body: JSON.stringify({error: error.message}),
          };
    }
};