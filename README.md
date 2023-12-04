<!-- This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details. -->

$ nvm use 16.14 && node server.js

it will run on https://localhost:3000

<carefull, http"s". not http>


# DeCartography

A computational oracle, driven by crowd-workers, clusters the big data generated from Gitcoin's quadratic funding.

## Prerequisites

Make sure you have the following installed on your system:

<!-- - [Go](https://golang.org/) (for the backend) -->

- Python

## Getting Started

### Setup

To set up the project for development or testing, run the following command to install dependencies and generate the `.env` file: `make setup`
This command will:
<!-- 1. Ensure Go modules are tidy for the backend (using go mod tidy). -->
- Generate a `.env` file in the `/backend` directory with placeholder values for `SCORER_ID`, `AUTH_KEY`, `ETHERSCAN_API_KEY`, `GITCOIN_API_KEY`, `ALCHEMY_API_KEY`. (**Make sure to replace these placeholder values with your actual credentials before using the backend.**)


<!-- ### Build

To build the project, you can use the following command: `make build`\
The `build` command will:
1. Build the backend executable (`backend_app`) using Go's build command. -->

### Run

To run the project, you can use the following command:
<!-- `go run main.go`\ -->
```$ python3 backend_app/handlers/handlers.py```

Please note:
- Before running the backend, make sure you have properly set up the `.env` file with your correct credentials.

## License (To Be Determined)

This project is licensed under the [License Name] - see the [LICENSE](LICENSE) file for details.

## Backend API Documentation

This documentation provides an overview of the backend API endpoints and their functionalities that are available for integration with the frontend of the web application.

---

## 1. Introduction

The backend API provides various endpoints to interact with the application's data and services. These endpoints handle user authentication, data retrieval, and data submission. Frontend developers can use these APIs to build the user interface and user interactions.

## 2. API Base URL

The base URL for all API endpoints is: `/api`

## 3. Authentication

Authentication is required for certain API endpoints. The authentication mechanism may involve using JWT (JSON Web Tokens) obtained after successful login. Refer to the frontend authentication logic for details on obtaining and using authentication tokens.

## 4. Endpoints

### Ping

- **URL**: `/ping`
- **Method**: GET
- **Description**: A simple endpoint to check the availability of the API server.
- **Authentication**: Not required.
- **Response**: JSON response with a "message" field.

### Get Signing Message

- **URL**: `/signing-message`
- **Method**: GET
- **Description**: Retrieves a signing message from the Gitcoin Passport API.
- **Authentication**: Not required.
- **Response**: JSON response with the "signing_message" field.

### Submit Passport

- **URL**: `/submit-passport`
- **Method**: POST
- **Description**: Submits a passport to the Gitcoin Passport API.
- **Authentication**: Required (JWT token).
- **Request**: JSON request body with "address," "signature," and "nonce" fields.
- **Response**: JSON response with various passport-related information.

### Get Ethereum Transactions

- **URL**: `/get-txs`
- **Method**: GET
- **Description**: Fetches Ethereum transactions for a specified address.
- **Authentication**: Not required.
- **Query Parameter**: "address" (Ethereum wallet address).
- **Response**: JSON response with Ethereum transaction data.

### Get Ethereum Balance

- **URL**: `/get-eth`
- **Method**: GET
- **Description**: Retrieves the Ether balance for a specified Ethereum address.
- **Authentication**: Not required.
- **Query Parameter**: "address" (Ethereum wallet address).
- **Response**: JSON response with the Ether balance.

### Get Addresses

- **URL**: `/get-addresses`
- **Method**: GET
- **Description**: Retrieves a list of Ethereum wallet addresses.
- **Authentication**: Required (JWT token).
- **Query Parameter**: "amount" (number of addresses to retrieve).
- **Response**: JSON response with an array of Ethereum wallet addresses.

### Insert Data

- **URL**: `/insert-data`
- **Method**: POST
- **Description**: Inserts data into the database.
- **Authentication**: Required (JWT token).
- **Request**: JSON request body with data fields.
- **Response**: JSON response confirming data insertion.

### Get Gitcoin Passport Score

- **URL**: `/get-passport-score`
- **Method**: GET
- **Description**: Retrieves the Gitcoin Passport score of the specified address
- **Authentication**: Not required.
- **Query Parameter**: "address" (Ethereum wallet address).
- **Response**: JSON response with the score.

## 5. Error Handling

The API returns appropriate HTTP status codes and error messages in case of errors. Frontend developers should handle errors gracefully and display error messages to users when needed.

For specific error responses and their meanings, refer to the API documentation and handle them accordingly in the frontend code.

---
