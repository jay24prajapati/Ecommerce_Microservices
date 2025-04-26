const {CognitoIdentityProviderClient, InitiateAuthCommand} = require("@aws-sdk/client-cognito-identity-provider");

const client = new CognitoIdentityProviderClient({
    region: process.env.REGION,
});

//Define Coginto App Client ID for user pool authention
const CLIENT_ID = process.env.CLIENT_ID;

exports.signIn = async  (event) =>{
    const {fullName, password} = JSON.parse(event.body);
    const username  = fullName.replace(/\s+/g, '_'); 

    const params = {
        ClientId: CLIENT_ID,
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: {
            USERNAME:username,
            PASSWORD: password,
        },
    };

    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST', 
    };

   try {
    const command = new InitiateAuthCommand(params);
    const response  = await client.send(command);
    return {
        statusCode:200,
        headers: corsHeaders, 
        body: JSON.stringify({msg:"User successfully signed in!",
        //this will contain  the AccessToken , RefreshToken, and idToken     
        tokens: response.AuthenticationResult,
        }),
    }; 
    
   } catch (error) {
    return {
        statusCode:400,
        headers: corsHeaders, 
        body:JSON.stringify({msg: 'sign-in failed', error:error.message}),
    };
   }
}
