# oauth-callback
This project sets up a OAuth2 Callback endpoint hosted on Vercel to facilitate the OAuth2 token exchange flow, specifically tailored to the Digi-Key API. It securely manages and refreshes access tokens using Vercel's Key Value (KV) storage system.

## Usage
### Setting Environment Variables
* `OAUTH_STATE`: A randomly generated string, used to verify the integrity of the callback.
* `CLIENT_ID`: OAuth Client ID.
* `CLIENT_SECRET`: OAuth Client Secret.
* `API_KEY`: A randomly generated string used to validate client's identity when retriving the token.
### OAuth2 Callback
The initial authentication needs to be initiated from the client side. Something like this will suffice.
```python
import requests
import webbrowser
params = {
    'response_type': 'code',
    'client_id': CLIENT_ID,
    'redirect_uri': 'https://vercel-app-url.vercel.app/api/callback'
}
# Point this to the Authorize URL
url = requests.Request('GET', authorize_url, params=params).prepare().url

# Direct the user to the Authorization URL; it will land at the callback endpoint
webbrowser.open(url)
```
The callback endpoint will get the authorization code from the URL and get the first access and refresh tokens. It will then store them in Vercel KV and return a `200`. 
### Obtaining Token
Then you need to get the token by calling the `token` endpoint with an API key that you set in Vercel Environmemt Variable as `API_KEY`.  The endpoint will return the current access token. If the access token has expired, it will automatically refresh the token. If the refresh token has expired, it will return an `401` instructing you to start a new OAuth2 flow.
### Verifying Token
The `verify` endpoint will check the tokens and return a status message indicating the condition of the tokens. You can query this endpoint to know whether you need to refresh the access token or start a new OAuth2 flow.
* `404`: Refresh token expired or does not exist.
* `202`: Access token expired but refresh token is valid.
* `200`: Both tokens are valid.

## Notes
* The expiry times for the tokens are also stored in Vercel KV. The access token is valid for 30 minutes and the refresh token is valid for 90 days.
* This project does not automatically handle token refreshes without an incoming request. If you retrieve the token after both the access token and refresh token have expired, you will have to initiate a new OAuth2 flow.