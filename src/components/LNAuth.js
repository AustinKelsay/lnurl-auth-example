import React, { useState, useEffect } from "react";
import axios from "axios";
import QRCode from "qrcode.react";
import { useSession, signIn } from "next-auth/react";
import { sign } from "@noble/secp256k1";

const LNAuth = () => {
  const [lnurl, setLnurl] = useState(null);
  const [k1, setK1] = useState(null);
  const [pubkey, setPubkey] = useState(null);
  const [csrfToken, setCsrfToken] = useState(null);

  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchCsrfToken = async () => {
      const response = await axios.get(
        "https://2128-2603-8080-1600-36df-80ac-5d75-667d-db32.ngrok.io/api/auth/csrf"
      );
      const csrfToken = response.data.csrfToken;

      setCsrfToken(csrfToken);
    };

    fetchCsrfToken();
  }, []);

  const signInUser = async () => {
    try {
      signIn("lightning", {
        k1,
        pubkey,
      });
    } catch (error) {
      console.error("Error signing in user:", error);
    }
  };

  useEffect(() => {
    const fetchLnurl = async () => {
      try {
        const response = await fetch("/api/auth/lnurl-challenge/");
        const data = await response.json();
        setLnurl(data.lnurl);
      } catch (error) {
        console.error("Error fetching lnurl:", error);
      }
    };

    fetchLnurl();
  }, []);

  useEffect(() => {
    const pollForVerifiedResponse = async () => {
      try {
        const response = await axios.get("/api/auth/pending", {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Expires: "0",
          },
        });

        const data = response.data;
        if (data.k1 && data.pubkey) {
          console.log("Verified response received from pending map:", data);
          setK1(data.k1);
          setPubkey(data.pubkey);
        }
      } catch (error) {
        console.error("Error polling for verified response:", error);
      }
    };

    const intervalId = setInterval(pollForVerifiedResponse, 2000);

    if (k1 && pubkey) {
      clearInterval(intervalId);
    }

    return () => clearInterval(intervalId);
  }, [k1, pubkey]);

  useEffect(() => {
    if (k1 && pubkey) {
      signInUser();
    }
  }, [pubkey, k1]);

  useEffect(() => {
    console.log("session", session);
  }, [session]);

  return (
    <div>
      {status === "loading" && <div>Loading...</div>}
      {status === "unauthenticated" && <QRCode size={256} value={lnurl} />}
      {status === "authenticated" && session.user.pubkey && (
        <div>
          <div>Signed in as {session.user.pubkey}</div>
        </div>
      )}
    </div>
  );
};

export default LNAuth;
