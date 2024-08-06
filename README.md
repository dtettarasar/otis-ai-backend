# otis-ai
Otis AI: Your Digital SEO Scribe!

## Backend parameters 

### Connect your Database first
create a .env file at the root of the backend folder and store in it the connection string, using the variable name "DB_URL"

~~~
DB_URL="mongodb+srv://<username>:<password>@<clustername>.0a0a0a0.mongodb.net/otis-ai?retryWrites=true&w=majority"
~~~

### Connect your Open AI account
In the .env file, add the required variables to build the connection with your Open AI account

~~~
OPEN_AI_ORG='org-6Z*********************m'
OPEN_AI_KEY='sk-ty********************************************cp'
~~~

### Add the Stripe API Key to handle payments: 
In the .env file, add the Stripe secret API key to handle payments, & the endpoint secret to handle webhooks

~~~
STRIPE_KEY='sk_51********************************************************************************************ps'
STRIPE_ENDPOINT_SECRET="whsec_8mb**********************************************************79m"
~~~

### Generate the required secrets 
use the command npm run get-secrets in the terminal, to get the required secrets for the JSON web tokens.

### Define the expiration time for the JSON web tokens 

~~~
ACCESS_TOKEN_EXP='2m'
REFRESH_TOKEN_EXP='4h'
~~~
