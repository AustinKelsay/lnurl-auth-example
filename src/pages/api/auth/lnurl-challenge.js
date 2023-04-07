import { utils, verify } from "@noble/secp256k1";
import { encodeLnurl } from "../../../utils";

export default function handler(req, res) {
  // Get the host from request headers
  const { host } = req.headers;

  const generatedK1 = utils.bytesToHex(utils.randomBytes(32));

  // Generate the lnurl-auth login URL using the full URL and generated k1 value
  const fullUrl = `https://${host}/api/auth/lnurl-auth`;
  const lnurl = generateLnurl(fullUrl, generatedK1);

  // Return the lnurl to the client for displaying the QR code
  return res.status(200).json({ lnurl });
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