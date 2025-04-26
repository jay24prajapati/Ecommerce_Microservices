# Ecommerce_Microservices

# E-commerce Serverless Backend

Welcome to the **E-commerce Serverless Backend** project! This is a fully serverless, microservices-based backend for an e-commerce platform, built using AWS services and the Serverless Framework. It provides functionality for user authentication, banner and category image management, product uploads with approval, and order processing. This repository is designed to be a scalable, cost-efficient solution leveraging AWS's serverless ecosystem.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Services](#services)
  - [authService](#authservice)
  - [bannerService](#bannerservice)
  - [categoryService](#categoryservice)
  - [productService](#productservice)
  - [orderService](#orderservice)
- [Prerequisites](#prerequisites)
- [Deployment](#deployment)
- [Usage](#usage)
- [Contributing](#contributing)

## Overview

This project implements a backend for an e-commerce application using a microservices architecture. Each service is independent, deployable, and communicates via HTTP APIs or event-driven mechanisms. Here's a brief overview of the services:

- **authService**: Manages user registration, authentication, and session management using AWS Cognito and DynamoDB.
- **bannerService**: Handles uploading and retrieving banner images, stored in S3 and tracked in DynamoDB.
- **categoryService**: Manages category images with a cleanup mechanism for outdated entries, using S3, DynamoDB, and SNS.
- **productService**: Allows authenticated users to upload products with images, includes an approval process, and cleans up outdated products, using S3, DynamoDB, and SNS.
- **orderService**: Processes customer orders with SQS for queueing, Step Functions for workflow management, and SES for email notifications, storing data in DynamoDB.

## Architecture

### Architecture Diagram

> [Microservices Architecture Diagram (Draw.io Link)](https://drive.google.com/file/d/1xqJjNxmAhRVTLqHqVCNo3ypW5Y93okYr/view?usp=sharing)

The application follows a microservices architecture, with each service handling a specific domain:

- **authService**: Uses AWS Cognito for user management and DynamoDB for storing user data.
- **bannerService**: Uploads images to S3 via pre-signed URLs, with S3 events triggering Lambda functions to update DynamoDB.
- **categoryService**: Similar to bannerService, with additional scheduled cleanup of outdated categories and SNS notifications.
- **productService**: Requires JWT authentication, stores product data in DynamoDB, and triggers image updates via S3 events, with scheduled cleanup.
- **orderService**: Queues orders in SQS, processes them with Step Functions, updates DynamoDB, and sends SES email notifications.

Services communicate via HTTP APIs (API Gateway) or event-driven triggers (S3 events, SQS messages, scheduled tasks).

## Services

### authService

**Purpose**: Handles user authentication and management.

**Endpoints**:

1. **Sign Up**

   - **Endpoint**: `POST /sign-up`
   - **Input**:
     ```json
     {
       "email": "jayspprajapati24@gmail.com",
       "fullName": "Jay S Prajapati",
       "password": "passwrod123"
     }
     ```
   - **Output**:
     ```json
     { "msg": "Account created. Please varify your email." }
     ```

2. **Confirm Sign Up**

   - **Endpoint**: `POST /confirm-sign-up`
   - **Input**:
     ```json
     {
       "fullName": "Jay S Prajapati",
       "confirmationCode": "274023"
     }
     ```
   - **Output**:
     ```json
     { "msg": "User successfully confirmed!" }
     ```

3. **Sign In**

   - **Endpoint**: `POST /sign-in`
   - **Input**:
     ```json
     {
       "fullName": "Jay S Prajapati",
       "password": "passwrod123"
     }
     ```
   - **Output**:
     ```json
     {
       "msg": "User successfully signed in!",
       "tokens": {
         "AccessToken": "...",
         "ExpiresIn": 3600,
         "IdToken": "...",
         "RefreshToken": "...",
         "TokenType": "Bearer"
       }
     }
     ```

4. **Sign Out**
   - **Endpoint**: `POST /sign-out`
   - **Input**:
     ```json
     {
       "accessToken": "..."
     }
     ```
   - **Output**:
     ```json
     { "msg": "User succesfully signed out!" }
     ```

**Notes**:

- Uses AWS Cognito for user pools.
- Stores user data in DynamoDB with a `userId` as the partition key.
- Usernames are derived from full names by replacing spaces with underscores.

### bannerService

**Purpose**: Manages banner images for the e-commerce platform.

**Endpoints**:

1. **Get Upload URL**

   - **Endpoint**: `POST /upload-url`
   - **Input**:
     ```json
     {
       "fileName": "baner1.png",
       "fileType": "image/png"
     }
     ```
   - **Output**:
     ```json
     {
       "uploadURL": "https://banner-images-jaysp-jy952466-new.s3.amazonaws.com/baner1.png?..."
     }
     ```

2. **Get All Banners**
   - **Endpoint**: `GET /banners`
   - **Output**:
     ```json
     {
       "banners": [
         {
           "imageUrl": "https://banner-images-jaysp-jy952466-new.s3.amazonaws.com/baner1.png"
         }
       ]
     }
     ```

**Notes**:

- Images are uploaded to S3 using pre-signed URLs.
- S3 events trigger a Lambda function to store metadata in DynamoDB.
- S3 bucket is publicly readable for banner retrieval.

### categoryService

**Purpose**: Manages category images with cleanup functionality.

**Endpoints**:

1. **Get Upload URL**

   - **Endpoint**: `POST /upload-url`
   - **Input**:
     ```json
     {
       "fileName": "fashion1.png",
       "fileType": "image/png",
       "categoryName": "fashion1"
     }
     ```
   - **Output**:
     ```json
     {
       "uploadUrl": "https://category-images-jaysp-jy952466-new.s3.amazonaws.com/fashion1.png?..."
     }
     ```

2. **Get All Categories**
   - **Endpoint**: `GET /categories`
   - **Output**:
     ```json
     [
       {
         "categoryName": "fashion1",
         "imageUrl": "https://category-images-jaysp-jy952466-new.s3.amazonaws.com/fashion1.png"
       }
     ]
     ```

**Notes**:

- Similar to bannerService, with added category metadata.
- A scheduled Lambda function (every 2 minutes) cleans up categories older than 1 hour without an image URL, notifying via SNS.
- S3 bucket is publicly readable.

### productService

**Purpose**: Manages product uploads and approvals.

**Endpoints**:

1. **Get Upload URL**

   - **Endpoint**: `POST /get-upload-url`
   - **Headers**: `Authorization: Bearer <JWT_TOKEN>`
   - **Input**:
     ```json
     {
       "fileName": "shoes.png",
       "fileType": "image/png",
       "productName": "gucci",
       "productPrice": 100,
       "description": "I love it.",
       "quantity": 40,
       "category": "Clothes"
     }
     ```
   - **Output**:
     ```json
     {
       "uploadUrl": "https://product-images-jaysp-jy952466-new.s3.amazonaws.com/shoes.png?..."
     }
     ```

2. **Get Approved Products**
   - **Endpoint**: `GET /approve-products`
   - **Output**:
     ```json
     {
       "products": [
         {
           "id": { "S": "df38e02c-2adf-4e3a-948f-c6d7bc02d767" },
           "fileName": { "S": "shoes.png" },
           "productName": { "S": "gucci" },
           "productPrice": { "N": "100" },
           "description": { "S": "I love it." },
           "quantity": { "N": "40" },
           "category": { "S": "Clothes" },
           "imageUrl": {
             "S": "https://product-images-jaysp-jy952466-new.s3.amazonaws.com/shoes.png"
           },
           "isApproved": { "BOOL": true },
           "email": { "S": "jayspprajapati24@gmail.com" },
           "createdAt": { "S": "2025-04-19T03:05:28.210Z" }
         }
       ]
     }
     ```

**Notes**:

- Requires JWT authentication from Cognito.
- Products are stored in DynamoDB with an `isApproved` flag (initially false).
- S3 events update the `imageUrl` after upload.
- A scheduled Lambda function (every 2 minutes) cleans up unapproved products older than 1 hour without an image URL, notifying via SNS.

### orderService

**Purpose**: Handles order placement and processing.

**Endpoints**:

1. **Place Order**
   - **Endpoint**: `POST /create-order`
   - **Headers**: `Authorization: Bearer <JWT_TOKEN>`
   - **Input**:
     ```json
     {
       "id": "df38e02c-2adf-4e3a-948f-c6d7bc02d767",
       "quantity": 30
     }
     ```
   - **Output**:
     ```json
     {
       "message": "order placed successfully",
       "orderId": "ac518658-bdf7-4b25-9df0-b21d59b3d59d"
     }
     ```

**Notes**:

- Requires JWT authentication.
- Orders are queued in SQS, processed by Step Functions (updates status to "shipping"), and stored in DynamoDB.
- SES sends email notifications to the user (e.g., "gucci now shipping").
- Checks stock availability against approved products.

## Prerequisites

Before deploying or using this project, ensure you have:

- An AWS account with credentials configured.
- Node.js (v22.x) and npm installed.
- Serverless Framework installed globally (`npm install -g serverless`).
- An AWS Cognito User Pool and App Client set up (Client ID stored in SSM as `/CLIENT_ID`).
- An SES-verified email address (`jayspprajapati24@gmail.com`) for notifications.

## Deployment

To deploy the project:

1. **Clone the Repository**:

   ```sh
   git clone https://github.com/<your-username>/ecommerce-serverless-backend.git
   cd ecommerce-serverless-backend
   ```

2. **Install Dependencies**:

   - For each service directory (`authService`, `bannerService`, etc.):
     ```sh
     cd <service-directory>
     npm install
     cd ..
     ```

3. **Configure AWS Resources**:

   - Store the Cognito App Client ID in AWS SSM:
     ```sh
     aws ssm put-parameter --name "/CLIENT_ID" --value "<your-client-id>" --type "SecureString" --region us-east-1
     ```
   - Verify your SES email identity:
     ```sh
     aws ses verify-email-identity --email-address jayspprajapati24@gmail.com --region us-east-1
     ```

4. **Deploy Each Service**:
   - From each service directory:
     ```sh
     cd <service-directory>
     serverless deploy
     cd ..
     ```
   - This creates API Gateway endpoints, Lambda functions, S3 buckets, DynamoDB tables, SQS queues, SNS topics, and Step Functions as defined in `serverless.yml`.

## Usage

Here are examples of how to interact with the APIs using `curl`:

1. **Sign Up a User**:

   ```sh
   curl -X POST https://jamibbyjdk.execute-api.us-east-1.amazonaws.com/sign-up \
   -d '{"email": "jayspprajapati24@gmail.com", "fullName": "Jay S Prajapati", "password": "Hello@123"}'
   ```

2. **Upload a Banner**:

   - Get the upload URL:
     ```sh
     curl -X POST https://8i8i5i1lo7.execute-api.us-east-1.amazonaws.com/upload-url \
     -d '{"fileName": "baner1.png", "fileType": "image/png"}'
     ```
   - Upload the file (replace `<upload-url>` with the returned URL):
     ```sh
     curl -X PUT -T baner1.png "<upload-url>"
     ```

3. **Place an Order**:
   - Sign in to get a JWT token, then:
     ```sh
     curl -X POST https://50pfyl8vea.execute-api.us-east-1.amazonaws.com/create-order \
     -H "Authorization: Bearer <JWT_TOKEN>" \
     -d '{"id": "df38e02c-2adf-4e3a-948f-c6d7bc02d767", "quantity": 30}'
     ```

Explore each service's section for more endpoint details.

## Contributing

We welcome contributions! To contribute:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m "Add your feature"`).
4. Push to your branch (`git push origin feature/your-feature`).
5. Open a pull request.
