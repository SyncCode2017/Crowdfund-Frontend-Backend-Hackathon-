import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import crypto from "crypto";

import ServerlessClient from "serverless-postgres";

type requestBodyEvent = {
  account: string;
  nftPerkAddress: string;
  tokenId: number;
};

type validateRequestEvent = {
  OTP: string;
};

let response: APIGatewayProxyResult;
const validPeriod = 15 * 60; // 15 minutes
const randStringLength: number = 9;
const user = process.env.user!;
const host = process.env.host!;
const database = process.env.database!;
const password = process.env.password!;

const client = new ServerlessClient({
  user: user,
  host: host,
  database: database,
  password: password,
  port: 5432,
  debug: true,
  delayMs: 3000,
});

const createTableQuery = `
CREATE TABLE IF NOT EXISTS tokens_requests (
  id serial PRIMARY KEY,
  nft_key VARCHAR(255) NOT NULL,
  account VARCHAR(50) NOT NULL,
  created_at BIGINT NOT NULL,
  expires_at BIGINT NOT NULL,
  randomString VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(50)
);
`;

const setRandomString = async (
  key: string,
  account: string,
  codeGenUnixTime: number,
  codeExpUnixTime: number,
): Promise<string | null> => {
  const bytes: Buffer = crypto.randomBytes(randStringLength);
  let _randomString: string;
  try {
    _randomString = bytes.toString("hex");

    const insertQuery = `INSERT INTO tokens_requests (nft_key, account, created_at, expires_at, randomString)
    VALUES ($1, $2, $3, $4, $5);`;

    const values = [key, account, codeGenUnixTime, codeExpUnixTime, _randomString];
    await client.connect();
    await client.query(insertQuery, values);
    await client.clean();
    return _randomString;
  } catch (err) {
    await client.clean();
    console.info(err);
  }
  return null;
};

const getValidRandomString = async (requestBody: requestBodyEvent): Promise<string | null> => {
  const codeGenUnixTime = Math.floor(new Date().getTime() / 1000);
  const codeExpUnixTime = codeGenUnixTime + validPeriod;
  let _randomString: string | null;

  // Extract data from the API event
  const key = `${requestBody.nftPerkAddress}${requestBody.tokenId}`;
  const account = requestBody.account;
  console.log("key", key);
  console.log("account", account);
  const existingRandQuery = `SELECT expires_at, randomString, status FROM tokens_requests WHERE nft_key = $1 ORDER BY expires_at DESC;`;

  try {
    // Create the table if it doesn't exist
    await client.connect();
    await client.query(createTableQuery);
    await client.clean();

    await client.connect();
    const existingRand = await client.query(existingRandQuery, [key]);
    console.log("existingRand", existingRand);
    //@ts-ignore
    const existingRandArr = existingRand.rows;
    console.log("existingRandArr[0]", existingRandArr[0]);
    await client.clean();
    console.log("current time:", codeGenUnixTime);

    if (existingRand.rowCount == 0) {
      _randomString = await setRandomString(key, account, codeGenUnixTime, codeExpUnixTime);
    } else if (Number(existingRandArr[0].expires_at) < codeGenUnixTime) {
      _randomString = await setRandomString(key, account, codeGenUnixTime, codeExpUnixTime);
    } else {
      _randomString = existingRandArr[0].randomstring;
    }
    return _randomString;
  } catch (err: any) {
    await client.clean();
    console.info(err);
  }
  return null;
};

const setStatusofValidOTP = async (otp: string): Promise<string | null> => {
  let status: string;
  const codeGenUnixTime = Math.floor(new Date().getTime() / 1000);
  const expTimeRandQuery = `SELECT expires_at, status FROM tokens_requests WHERE randomString = $1;`;
  const updateQuery = `UPDATE tokens_requests SET status = $1 WHERE randomString = $2;`;
  try {
    await client.connect();
    const expireTime = await client.query(expTimeRandQuery, [otp]);
    console.log("expireTime", expireTime);

    //@ts-ignore
    const expireTimeRandArr = expireTime.rows;
    console.log("expireTimeRandArr[0]", expireTimeRandArr[0]);
    await client.clean();
    console.log("current time:", codeGenUnixTime);
    if (expireTime.rowCount <= 0) {
      return "invalid";
    } else if (Number(expireTimeRandArr[0].expires_at) >= codeGenUnixTime && expireTimeRandArr[0].status == null) {
      status = "used";
      const values = [status, otp];

      await client.connect();
      await client.query(updateQuery, values);
      await client.clean();

      return "valid";
    } else {
      return "used or expired";
    }
  } catch (err) {
    console.info(err);
  }
  return null;
};

export const generateTokens: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
  context,
): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod !== "POST") {
    return (response = {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
      },
      body: `${event.httpMethod} Not allowed`,
    });
  }

  const requestBody: requestBodyEvent = JSON.parse(event.body as string); //event as unknown as requestBodyEvent;
  console.log("requestBody:", requestBody);

  const randomString = await getValidRandomString(requestBody);
  if (randomString != null) {
    response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
      },
      body: JSON.stringify(randomString),
    };
  } else {
    response = {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
      },
      body: `Error generating token for tokenId ${requestBody.tokenId}`,
    };
  }

  return response;
};

export const validateRandomString: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
  context,
): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod !== "POST") {
    return (response = {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
      },
      body: `${event.httpMethod} Not allowed`,
    });
  }

  const requestBody: validateRequestEvent = JSON.parse(event.body as string); //event as unknown as validateRequestEvent;
  console.log("requestBody:", requestBody);
  let otpStatus: string | null;
  try {
    // confirming the otp code
    otpStatus = await setStatusofValidOTP(requestBody.OTP);
    if (otpStatus == "valid") {
      response = {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
        },
        body: JSON.stringify(otpStatus),
      };
    } else {
      response = {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
        },
        body: `Error: OTP is ${otpStatus!}`,
      };
    }
  } catch (err: any) {
    console.info(err);
    response = {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
      },
      body: `Error validating OTP ${requestBody.OTP}`,
    };
  }

  return response;
};
