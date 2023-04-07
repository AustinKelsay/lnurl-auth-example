import { utils, verify } from "@noble/secp256k1";
import pending from "@/map";

function verifySig(sig, k1, key) {
  // Verify a secp256k1 signature
  const sigB = utils.hexToBytes(sig);
  const k1B = utils.hexToBytes(k1);

  // Verify the signature using the secp256k1 library
  return verify(sigB, k1B, key);
}

export default function handler(req, res) {
  const { tag, k1, sig, key } = req.query;

  if (tag == "login" && k1 && sig && key) {
    try {
      if (verifySig(sig, k1, key)) {
        // Update the pending map
        pending.k1 = k1;
        pending.pubkey = key;

        return res.status(200).json({ status: "OK", k1, pubkey: key });
      }
    } catch (e) {
      console.error(e);
    }
  }

  return res.status(200).json({ status: "FAIL" });
}
