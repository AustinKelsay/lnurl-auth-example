import { utils, verify } from "@noble/secp256k1";
import { encodeLnurl } from "../../utils";
// import { withIronSession } from "iron-session/next";
// import { ironSessionOptions } from "../../ironSessionOptions";

const pending = new Map();

export default async function handler(req, res) {
  // Get the host from request headers
  const { host } = req.headers;

  // Get query parameters from request
  const { tag, k1, sig, key } = req.query;

  if (tag === "login" && k1 && sig && key) {
    // If all required parameters are present (tag, k1, sig, key), proceed to verify the signature
    if (pending.has(k1) && verifySig(sig, k1, key)) {
      // If the signature is valid and k1 is in the pending map, the request is valid
      // Remove k1 from the pending map to prevent reuse
      pending.delete(k1);

      // Store the user key in the session
      req.session.set("userKey", key);
      await req.session.save();

      console.log("User logged in successfully!");

      console.log("k1:", k1);

      console.log("sig:", sig);

      console.log("key:", key);

      // Handle successful login or authorization (e.g., store user data securely, perform actions)
      return res.status(200).json({ status: "OK" });
    } else {
      // If the signature is not valid or k1 is not in the pending map, return an error
      return res
        .status(400)
        .json({ status: "ERROR", reason: "Invalid request" });
    }
  } else {
    // If the required parameters are not present, generate a new k1 value
    const generatedK1 = utils.bytesToHex(utils.randomBytes(32));
    // Store the generated k1 value in the pending map, awaiting for a signature verification
    pending.set(generatedK1, {});

    console.log(req.url, "yoooooooo");

    // Generate the lnurl-auth login URL using the full URL and generated k1 value
    const fullUrl = `https://${host}${req.url}`;
    const lnurl = generateLnurl(fullUrl, generatedK1);

    // Return the lnurl to the client for displaying the QR code
    return res.status(200).json({ lnurl });
  }
}

function generateLnurl(url, k1) {
  // Generate the lnurl-auth login URL with the provided k1 value
  // The login URL should include the tag, k1 value, and action
  return encodeLnurl(`${url}?tag=login&k1=${k1}&action=login`);
}

function verifySig(sig, msg, key) {
  // Verify a secp256k1 signature
  // Convert the hexadecimal signature and message to byte arrays
  const sigB = utils.hexToBytes(sig);
  const msgB = utils.hexToBytes(msg);

  // Verify the signature using the secp256k1 library
  return verify(sigB, msgB, key);
}
