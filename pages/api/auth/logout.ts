import { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.redirect(
    `${
      process.env.AUTH_ISSUER
    }/protocol/openid-connect/logout?redirect_uri=${encodeURIComponent(
      process.env.NEXTAUTH_URL!
    )}`
  );
}
