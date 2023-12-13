import { ethers } from "ethers";

export const handleLogin = async (): Promise<string | Error> => {
  console.log(process.env.BACKEND_URL);
  const baseUrl =
    // process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:1337"; // Fallback to empty string if not defined
    process.env.NEXT_PUBLIC_BACKEND_URL || "https://localhost:1337"; // Fallback to empty string if not defined
  try {
    const connect = async (): Promise<string | null> => {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        return accounts[0] || null;
      } catch (err) {
        console.error("Error connecting to the wallet:", err);
        return null;
      }
    };

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.listAccounts();
    let account = accounts && accounts[0] ? accounts[0] : null;

    if (!account) {
      account = await connect();
    }

    if (!account) {
      throw new Error("No connected wallet");
    }

    // Fetch the signing message for authentication
    // const response = await fetch(
    //   `${baseUrl}/api/signing-message?address=${account}`,
    // );
    const response = await fetch(
      // `https://localhost:1337/api/signing-message?address=${account}`,
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/signing-message?address=${account}`,
    );
    const result = await response.json();
    const signingMessage = result.signing_message;

    // Extract nonce from the signing message using regex
    const regex = /Nonce: ([a-fA-F0-9]+)/;
    const matches = signingMessage.match(regex);
    if (!matches || matches.length !== 2) {
      throw new Error("Nonce extraction failed");
    }

    const nonceValue = matches[1];
    const signer = provider.getSigner();
    const signature = await signer.signMessage(signingMessage);

    // Send authentication details to the backend for verification
    // const authResponse = await fetch(`${baseUrl}/api/submit-passport`, {
      // const authResponse = await fetch(`https://localhost:1337/api/submit-passport`, {
      const authResponse = await fetch(`http://localhost:1337/api/submit-passport`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: account,
        signature: ethers.utils.hexlify(signature),
        nonceValue,
      }),
    });

    if (!authResponse.ok) {
      const contentType = authResponse.headers.get("Content-Type");

      let serverErrorMessage = "Unknown error";

      if (contentType && contentType.includes("application/json")) {
        const jsonErrorData = await authResponse.json();
        serverErrorMessage = jsonErrorData.error || "Authorization failed";
      } else {
        serverErrorMessage = await authResponse.text();
      }

      throw new Error(`Authorization failed: ${serverErrorMessage}`);
    }

    const authData = await authResponse.json();
    const token = authData.token; // Assuming the token is returned in the 'token' field

    return token;
  } catch (error) {
    if (error instanceof Error) {
      return error;
    }
    return new Error(String(error));
  }
};
