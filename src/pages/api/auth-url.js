import crypto from "crypto";
import { createHash } from "crypto";
import secp256k1 from "secp256k1";
import { bech32 } from "bech32";

// Generate a random k1 challenge
const generateK1 = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Verify client signature
const verifySignature = (k1, signature, publicKey) => {
  const msgHash = createHash("sha256").update(Buffer.from(k1, "hex")).digest();
  const signatureBuffer = Buffer.from(signature, "hex");
  const publicKeyBuffer = Buffer.from(publicKey, "hex");

  return secp256k1.verify(msgHash, signatureBuffer, publicKeyBuffer);
};

// Server-side LNURL-auth handler
export default async function handler(req, res) {
  if (req.method === "GET") {
    const k1 = generateK1();
    const authURL = `http://localhost:3000/api/auth-url?tag=login&k1=${k1}&action=login`;
    const encodedUrl = bech32.encode(
      "lnurl",
      bech32.toWords(Buffer.from(authURL))
    );
    res.status(200).json({ url: encodedUrl });
  } else if (req.method === "POST") {
    const { k1, sig, key } = req.body;

    if (!k1 || !sig || !key) {
      res
        .status(400)
        .json({ status: "ERROR", reason: "Missing required parameters" });
      return;
    }

    if (verifySignature(k1, sig, key)) {
      // Perform the appropriate action (e.g., register, login, link, or auth)
      // based on the `action` parameter in the LNURL-auth URL.
      // Store the user's public key as their identifier.

      res.status(200).json({ status: "OK" });
    } else {
      res.status(400).json({ status: "ERROR", reason: "Invalid signature" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
