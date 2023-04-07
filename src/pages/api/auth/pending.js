// src/pages/api/auth/pending.js
import pending from "@/map";

export default function handler(req, res) {
  const { k1, pubkey } = pending;
  res.status(200).json({ k1, pubkey });
}
