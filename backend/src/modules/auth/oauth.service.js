import { Google, GitHub } from "arctic";
import config from "../../config/env.js";

/**
 * Arctic OAuth Providers Configuration
 */

export const googleProvider = new Google(
  config.oauth.google.clientId,
  config.oauth.google.clientSecret,
  config.oauth.google.redirectUri
);

export const githubProvider = new GitHub(
  config.oauth.github.clientId,
  config.oauth.github.clientSecret,
  config.oauth.github.redirectUri
);

/**
 * Helper to fetch user data from Google
 */
export const getGoogleUser = async (accessToken) => {
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return await response.json();
};

/**
 * Helper to fetch user data from GitHub
 */
export const getGitHubUser = async (accessToken) => {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const user = await response.json();

  // GitHub email might be private, fetch explicitly if needed
  if (!user.email) {
    const emailsResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const emails = await emailsResponse.json();
    const primaryEmail = emails.find((e) => e.primary && e.verified) || emails[0];
    user.email = primaryEmail?.email;
  }

  return user;
};
