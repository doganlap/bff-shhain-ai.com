import { PublicClientApplication } from '@azure/msal-browser';
import { graphConfig } from './config';

const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_APP_CLIENT_ID,
    authority: import.meta.env.VITE_APP_AUTHORITY,
    redirectUri: import.meta.env.VITE_APP_REDIRECT_URI,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

const msalInstance = new PublicClientApplication(msalConfig);

export const loginRequest = {
  scopes: ['User.Read'],
};

export async function callMsGraph() {
  const account = msalInstance.getActiveAccount();
  if (!account) {
    throw Error('No active account! Verify a user has been signed in and setActiveAccount has been called.');
  }

  const response = await msalInstance.acquireTokenSilent({
    ...loginRequest,
    account: account,
  });

  const headers = new Headers();
  const bearer = `Bearer ${response.accessToken}`;

  headers.append('Authorization', bearer);

  const options = {
    method: 'GET',
    headers: headers,
  };

  return fetch(graphConfig.graphMeEndpoint, options)
    .then((response) => response.json())
    .catch((error) => console.log(error));
}

export default msalInstance;