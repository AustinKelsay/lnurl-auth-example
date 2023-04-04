export const ironSessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD,
  cookieName: "lnurl-auth-example",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};
