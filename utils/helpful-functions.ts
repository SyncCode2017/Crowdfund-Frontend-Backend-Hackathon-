import axios from "axios";

type ResponseType = {
  statusCode: number;
  headers: {
    key: string;
  };
  data: string;
};

export async function generateRandomString(
  account: string,
  nftPerkAddress: string,
  tokenId: number
): Promise<string | null> {
  const request = {
    account: account,
    nftPerkAddress: nftPerkAddress,
    tokenId: tokenId,
  };

  /** The APIs here are developed with AWS Lambda, RDS and API Gateway.
   * Please see the ./backend-aws/proveddit-apis folder for the code
   * for the backend.
   */

  // API to validate OTP
  // https://0jaqaxb9z2.execute-api.eu-west-2.amazonaws.com/dev/proveddit/validate-otp
  // to be called by businesses.Returns "valid", "invalid" or "used or expired" depending
  // on the status of the random string posted with the request.

  try {
    // generate random string
    const response: ResponseType = await axios.post(
      "https://0jaqaxb9z2.execute-api.eu-west-2.amazonaws.com/dev/proveddit/generate-token",
      request
    );
    // console.log("response is", response.data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
  return null;
}
