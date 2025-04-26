const UserModel = require('../models/UserModel');

const {CognitoIdentityProviderClient, SignUpCommand} = require('@aws-sdk/client-cognito-identity-provider');



const client = new CognitoIdentityProviderClient({
    region: process.env.REGION,
});

//Define Coginto App Client ID for user pool authention
const CLIENT_ID = process.env.CLIENT_ID;


exports.signUp = async (event)=>{
    //Parse the incoming request body to extract user data
    const {email, password, fullName}  = JSON.parse(event.body);
    const username  = fullName.replace(/\s+/g, '_'); //replace space with underscore

    //Configure parameters for Cognito  SignupCommand
    const params = {
        ClientId : CLIENT_ID,
        Username: username, 
        Password: password,
        UserAttributes:[
            {Name: 'email', Value: email},
            {Name: 'name', Value: fullName},

        ]
    };

    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST', 
    };

try {
    //Create user in Cognito user pool
    const command = new SignUpCommand(params);

    await client.send(command);

    const newUser  = new UserModel(email,username);
    
    await newUser.save();


    return {
        statusCode:200,
        headers: corsHeaders, 
        body: JSON.stringify({msg:"Account created. Please varify your email."}),
    };
} catch (error) {
    return {
        statusCode:400,
        headers: corsHeaders,
        body:JSON.stringify({msg: 'sign-up failed', error:error.message}),
    };
}
}
