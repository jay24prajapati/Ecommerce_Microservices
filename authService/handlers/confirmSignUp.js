const {CognitoIdentityProviderClient, ConfirmSignUpCommand} = require("@aws-sdk/client-cognito-identity-provider");

const client = new CognitoIdentityProviderClient({
    region: process.env.REGION,
});

const CLIENT_ID = process.env.CLIENT_ID;


exports.confirmSignUp = async (event) =>{
    const {fullName, confirmationCode}  = JSON.parse(event.body);
    const username  = fullName.replace(/\s+/g, '_'); 
    const params = {
        ClientId: CLIENT_ID,
        Username :username,
        ConfirmationCode:confirmationCode,
    };

    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST',
    };

    try {
        const command = new ConfirmSignUpCommand(params);

        await client.send(command);

        return {
            statusCode:200,
            headers: corsHeaders,
            body: JSON.stringify({msg:"User successfully confirmed!"}),
        };  
    } catch (error) {
        return {
            statusCode:400,
            headers: corsHeaders, 
            body:JSON.stringify({msg: 'confirmation failed', error:error.message}),
        };
    }
}