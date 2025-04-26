const {SESClient , SendEmailCommand} = require('@aws-sdk/client-ses');

const sesClient = new SESClient({region:"us-east-1"});

exports.sendOrderEmail = async (toEmail, orderId, productName, quantity, content) =>{
    //Email parameters
    const emailParams = {
        Source: 'jayspprajapati24@gmail.com',
        Destination: {
            ToAddresses: [toEmail], 
        },
      Message:{
        Subject: {
            Data: 'Your Order Confirmation',
        },
        Body:{
            Text:{
                Data: `Thank you for your order\n\nOrder ID ${orderId}\nProduct: ${productName}\n${content}.`,
            },
        },
      },
    };

    try {
        const command = new SendEmailCommand(emailParams);
        await sesClient.send(command);
    } catch (error) {
        throw new Error(error.message || "Error Unknown");
    }
}