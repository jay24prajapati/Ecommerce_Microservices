const {CognitoIdentityProviderClient,GlobalSignOutCommand} = require("@aws-sdk/client-cognito-identity-provider");

const client = new CognitoIdentityProviderClient({
    region: process.env.REGION,
});


exports.signOut = async (event)=>{
    const {accessToken} = JSON.parse(event.body);

   const params ={
    //The access token from the sign in response 
    AccessToken :accessToken,
   };

    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST', 
    };

   try {
    const command = new GlobalSignOutCommand(params);
    await client.send(command);
    return {
        statusCode:200,
        headers: corsHeaders,
        body: JSON.stringify({msg:"User succesfully signed out!"}),
    };
   } catch (error) {
    return {
        statusCode:400,
        headers: corsHeaders, 
        body:JSON.stringify({msg: 'sign-out failed', error:error.message}),
    };
   }
}