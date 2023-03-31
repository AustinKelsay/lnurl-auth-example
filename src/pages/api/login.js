import { utils, verify } from "@noble/secp256k1";
import { encodeLnurl } from "../../utils";

const pending = new Map();

export default async function handler(req, res) {
  // Get the host from request headers
  const { host } = req.headers;

  // Get query parameters from request
  const { tag, k1, sig, key } = req.query;

  if (tag === "login" && k1 && sig && key) {
    // If all required parameters are present, verify the signature
    if (pending.has(k1) && verifySig(sig, k1, key)) {
      // If the signature is valid, remove k1 from the pending map
      pending.delete(k1);
      // Handle successful login or authorization (e.g., store user data securely, perform actions)
      return res.status(200).json({ status: "OK" });
    } else {
      // If the signature is not valid or k1 is not in the pending map, return an error
      return res
        .status(400)
        .json({ status: "ERROR", reason: "Invalid request" });
    }
  } else {
    // Generate a new k1 value and store it in the pending map
    const generatedK1 = utils.bytesToHex(utils.randomBytes(32));
    pending.set(generatedK1, {});

    // Generate the lnurl-auth login URL
    const fullUrl = `https://${host}${req.url}`;
    const lnurl = generateLnurl(fullUrl, generatedK1);

    // Return the lnurl to the client
    return res.status(200).json({ lnurl });
  }
}

function generateLnurl(url, k1) {
  // Generate the lnurl-auth login URL with the provided k1 value
  return encodeLnurl(`${url}?tag=login&k1=${k1}&action=login`);
}

function verifySig(sig, msg, key) {
  // Verify a secp256k1 signature
  const sigB = utils.hexToBytes(sig);
  const msgB = utils.hexToBytes(msg);
  return verify(sigB, msgB, key);
}
