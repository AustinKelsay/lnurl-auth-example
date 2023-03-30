import React, { useState, useEffect } from "react";
import axios from "axios";
import QRCode from "qrcode.react";

const LNAuth = () => {
  const [authURL, setAuthURL] = useState(null);

  useEffect(() => {
    const fetchAuthURL = async () => {
      try {
        const response = await axios.get("/api/auth-url");
        setAuthURL(response.data.url);
      } catch (error) {
        console.error("Failed to fetch auth URL:", error);
      }
    };

    fetchAuthURL();
  }, []);

  return (
    <div>
      {authURL && (
        <div>
          <h1>Login with LNURL-auth</h1>
          <br />
          <QRCode size={512} value={authURL} />
          <p>Scan this QR code with your LN wallet to log in.</p>
        </div>
      )}
    </div>
  );
};

export default LNAuth;
