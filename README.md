# Apigee JWT Signed Strategies


## Summary
The great part about the [JWT Java Callout](https://github.com/apigee/iloveapis2015-jwt-jwe-jws) is that Apigee Edge now supports JWTs.  Now for the bad news.  If you use a JWT on proxy instead of a Verify Access Token or Verify API Key policy then Apigee Edge will not know who called the proxy and subsequently will not populate all the developer analytics data.  One of the key benefits of using OAuth 2.0 and Apigee Edge is to protect your API and capture analytics about who is calling your API and what they are calling.  One of the benefits of using JWTs is that you can validate it locally without contacting an authorization server.  

Hence the reason for this repo, which demonstrates how to extract the client ID from the JWT so that you can use a Verify API Key policy to validate the client ID a.k.a JWT azp [authorized party].  If you add this to your proxy, then not only are you protecting your API with JWTs, but you can also identify who is calling the proxy.  This means that you developer analytics data will be populated accordingly.  

Demonstrate two items:
1. Extract the `azp` from an Auth0 JWT and use the Verify API Key policy to validate it.
2. Create a JWT in Apigee Edge and save the client ID as the `azp`.


## Prerequisites
* This repo relies on [apigee-auth0-external-authorization](https://github.com/swilliams11/apigee-auth0-external-authorization).  So make sure to read that one throughly.  

* You may need to [install acurl](http://docs.apigee.com/api-services/content/using-oauth2-security-apigee-edge-management-api#howtogetoauth2tokens).


* You must export the following environment variables:
```
export ae_password=apigeepassword
export ae_username=apigeeusername
export ae_org=apigeeorg
```

### Auth0
You should:
* create an account in [Auth0](https://auth0.com/)
* create an [Auth0 client](https://auth0.com/docs/clients) to obtain a client ID and secret.
* create an [Auth0 API](https://auth0.com/docs/apis)

A good starting point is to read this [community article](https://community.apigee.com/articles/42269/auth0-with-apigee.html). It provides instructions to setup a new Auth0 client to obtain a client ID and secret.

* The redirect URI that you should enter is listed below.
  * `https://org-env.apigee.net/oauth_auth0/redirect` if you are going to save the Auth0 authorization code in Apigee Edge.
  * `https://org-env.apigee.net/oauth_auth0_store_jwt/redirect` if you are going to save the Auth0 authorization code and access token in Apigee Edge.
* Create a user in Auth0. This is the user that you will use to login during the redirect step.

### Update edge.json
You should update the following entries in the `jwt-signed-strategies/edge.json` file. Just use a find and replace to update all the values shown below.  
* `yourdomain.auth0.com`
* `https://yourdomain.auth0.com`
* `https://org-env.apigee.net/`

### Helpful to Know
You don't have to review these links, since I list all the commands to deploy the proxy.  But if you are interested in learning more about the config and deploy plugins, then you should read them.  
* [apigee-config-maven-plugin](https://github.com/apigee/apigee-config-maven-plugin)
* [apigee-maven-deploy-plugin](https://github.com/apigee/apigee-deploy-maven-plugin)


## Deploy the Proxy
This will deploy the `jwt_signed_strategies` proxy and create the Apigee developer named `john@example.com`, a product named `jwt-sign-strategies-product` and an app named `jwt-sign-strategies-app`.  

If you are running this for the first time then you must deploy the proxy first, before you run the config step.  Then run the config step below.
```
cd jwt-signed-strategies
mvn install -Ptest -Dusername=$ae_username -Dpassword=$ae_password \
                    -Dorg=$ae_org -Dauthtype=oauth
```

If the proxy is deployed, then you can run this step.  It will redeploy the proxy and create the necessary configuration.  
```
mvn install -Ptest -Dusername=$ae_username -Dpassword=$ae_password \
                    -Dorg=$ae_org -Dauthtype=oauth -Dapigee.config.options=create
```

## Create the client ID and secret in Edge
Once you create the client in Auth0 and create the Apigee product and app, then you have to add the client ID and secret into Apigee Edge. Use the following API calls to add the credentials to Apigee Edge.

[Create a consumer key/secret](http://docs.apigee.com/management/apis/post/organizations/%7Borg_name%7D/developers/%7Bdeveloper_email_or_id%7D/apps/%7Bapp_name%7D/keys/create)

Use the developer `john@example.com` and the app named `jwt-sign-strategies-app`.

[Associate the consumer key and secret with an Apigee product](http://docs.apigee.com/management/apis/post/organizations/%7Borg_name%7D/developers/%7Bdeveloper_email_or_id%7D/apps/%7Bapp_name%7D/keys/%7Bconsumer_key%7D)

The payload for this request is shown below.
```
{ "apiProducts": ["jwt-sign-strategies-product"] }
```

## Proxy Summary
The following flows are included:
* `/validate-auth0`
  * this flow fetches the JWK from Auth0
  * validates the JWT with the appropriate public certificate
  * extracts the `azp` and uses the Verify API Key policy to validate the client ID
* `/validate-auth0-2`
  * this flow decodes the JWT
  * extracts the azp
  * verifies the client Id (azp) with the Verify API Key policy
* `/create-rs256` - creates an JWT and includes `azp` claim in the payload section.

## Test the Deployment

* This request will validate the Auth0 JWT and extract the `azp` to validate it.
```
curl -X POST https://org-env.apigee.net/jwt_signed_strategy/validate-auth0 \
-H 'content-type: application/x-www-form-urlencoded' \
-d 'jwt=eyJ...jeBZqPZGNpw'
```

* This request will decode the JWT, extract the client ID (azp) and validate that first before verifying the JWT.  
```
curl -X POST https://org-env.apigee.net/jwt_signed_strategy/validate-auth0-2 \
-H 'content-type: application/x-www-form-urlencoded' \
-d 'jwt=eyJ...jeBZqPZGNpw'
```

* This request creates a JWT and includes the client ID as the `azp` (authorized party) attribute.
```
curl -X POST https://org-env.apigee.net/jwt_signed_strategy/create-rs256?apikey={yourAPIKey} \
-H 'content-type: application/x-www-form-urlencoded' \
-d ''
```

**Response**
```{
  "jwt" : "eyJhb_iw-4qSH4DA"
}```

**Decoded JWT**

```{
  "primarylanguage": "English",
  "sub": "jwt_signed_strategies",
  "aud": "Optional-String-or-URI",
  "azp": "1itEDZ",
  "iss": "http://yourcompany.net",
  "exp": 1498174140,
  "iat": 1498172340
}```
