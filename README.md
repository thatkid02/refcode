# ReFCode

## Setup

- Folder Structure
  - app 
  - api
  - db
  - docker

- Add necessary environment variables
```.env
# api env path: ./.env
REFCODE_POSTGRES_DB_HOST=postgres
REFCODE_POSTGRES_DB_PORT=5432
REFCODE_POSTGRES_DB_USER=admin
REFCODE_POSTGRES_DB_PASSWORD=admin
REFCODE_POSTGRES_DB_NAME=refcode
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin
PG_DATA=/var/lib/postgresql/data

HOST_IP=
JWT_SECRET=

# app env path: ./app/.env
REACT_APP_CONSUMER_KEY=
REACT_APP_CONSUMER_SECRET=
REACT_APP_BASE_API_URL=
REACT_APP_GOOGLE_CLIENT_ID=
REACT_APP_URL=
```
- Once env are added run following command
    - ports are exposed as following
        - app : *5174*
        - api : *3018*
        - postgres : *5432*
        - pgadmin: *5050* 
- Run the schema from db/main.sql on pgadmin/cli postgres

- NGINX config is set by forwarding the mentioned ports

```bash
docker compose up
```

## Sign in with Twitter Flow

1. Authorize the app for the first time using consumer key and secret
2. Authenticate the next time
3. Retrieve the oauth token with oauth verifier (oauth1.0)
4. Verify Credentials to get user details such as email id 

## Sign in with Google

1. With Client Id fetch users
2. Select User to fetch oauth2 token
3. Fetch user info using that token

## Wallet MetaMask Sign in

1. Provider Call from ether object available from global browser context
2. Fetch Selected Account address
3. Fetch any transactional data

### Project Referral Code

1. User can signup with/without referral code
2. Wallet authorization allows to check generate and score page
3. One to many relations from user to auth providers
4. Registering through any above will generate refresh token with expiry of 7 days
5. Login gives AccessToken with 1hr of expiration
6. Guards are added on required authenticated routes such as /referral and /score page details
7. Referral code can be generated any number of times but previously generated code are invalidated
8. Referral code have expiry of 1hr

