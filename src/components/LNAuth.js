import React, { useState, useEffect } from "react";
import QRCode from "qrcode.react";

const LNAuth = () => {
  const [lnurl, setLnurl] = useState(null);

  useEffect(() => {
    // Fetch the lnurl from the API
    const fetchLnurl = async () => {
      try {
        const response = await fetch("/api/login");
        const data = await response.json();
        setLnurl(data.lnurl);
      } catch (error) {
        console.error("Error fetching lnurl:", error);
      }
    };

    fetchLnurl();
  }, []);

  return (
    <div>
      {lnurl ? <QRCode value={lnurl} size={256} /> : <p>Loading QR Code...</p>}
    </div>
  );
};

export default LNAuth;
