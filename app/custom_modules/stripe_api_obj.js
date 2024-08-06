const stripe = require('stripe')(process.env.STRIPE_KEY);
const dataBaseObj = require('./database_obj');
const clientUrl = process.env.VUE_CLIENT_SERVER;

const stripeApiObj = {

    async createCheckoutSession(userId, creditQuantity) {

        const sessionObj = {
            creationStatus: null,
            stripeResponse: null
        }

        /*
            Récupérer le user ID et la quantité de crédit acheté en paramètre de la méthode. 
            Vérifier que le user id est valide et qu'il correspond bien à un compte d'utilisateur présent dans mongodb
            Avec le user ID : récupérer ou créer le stripe customer account et récupérer le customer id. 
            Construire les liens des pages de success ou de cancel de payment

            Avec tous ces éléments construire la checkout session, récupérer la session url la renvoyer au vue client
            pour que le vue client redirige l'utilisateur vers la page de paiement stripe

        */

        console.log('stripe api: init create checkout session method');
        console.log('userId: ' + userId);
        console.log('creditQuantity: ' + creditQuantity);

        let customer = await this.createStripeCustomerObj(userId);

        console.log('customer data from stripe: ');
        console.log(customer);

        console.log('session creation: ');

        try {

            sessionObj.stripeResponse = await stripe.checkout.sessions.create({

                line_items: [
                    {
                        price_data: {
                            currency: 'eur',
                            product_data: {
                                name:'Otis-Credit'
                            },
                            unit_amount: 100
                        },
                        quantity: creditQuantity
                    }
                ],
                mode: 'payment',
                customer: customer.id,
                success_url: `${clientUrl}/success-payment`,
                cancel_url: `${clientUrl}/cancel-payment`
        
            });

            sessionObj.creationStatus = true;
    
            //console.log(sessionObj);

        } catch (err) {

            //console.log(err);
            sessionObj.creationStatus = false;
            sessionObj.error = err;

        }

        console.log('------------ End of createCheckoutSession method ------------');

        return sessionObj;

    },

    async createStripeCustomerObj(userId) {

        let customer = {};

        // console.log('init createStripeCustomerObj method');

        const stripeCustomerId = await dataBaseObj.getUserStripeId(userId);
        // console.log('userId: ' + userId);
        // console.log("stripeCustomerId: " + stripeCustomerId);

        // Si l'utilisateur a un stripe user ID, récupérer les data du stripe user account
        if (stripeCustomerId) {

            try {

                customer = await stripe.customers.retrieve(stripeCustomerId);

                // console.log(customer);

            } catch (error) {

                console.log("error in createStripeCustomerObj method:");
                console.log(error);

            }

        }

        if (customer.deleted === true || !stripeCustomerId) {

            // console.log("Stripe customer has been deleted or not created yet");

            // Identifier le user pour lequel créer ou mettre à jour le stripe customer id
            let userToUpdate = await dataBaseObj.findUserById(userId);

            // console.log("user found");
            // console.log(userToUpdate); 

            if (!userToUpdate) {

                console.log('error: user not found');

            } else {

                // Créer un nouveau stripe customer 
                customer = await stripe.customers.create({
                    email: userToUpdate.email,
                    metadata: {
                        description: 'Otis Customer',
                        otisUserId: userId,
                        username: userToUpdate.username
                    },
                    name: `otis_ai_${userToUpdate.username}_${userId}` 
                });

                userToUpdate.set({ stripeCustomerId: customer.id });
                await userToUpdate.save();
            }

            // console.log('user to update after stripe user creation: ');
            // console.log(userToUpdate);

        }

        // console.log('customer data:');
        // console.log(customer);
        // console.log("end of createStripeCustomerObj method----------------");

        return customer;

    },

    async webhookHandler(stripeSignature) {

        

    }

}

module.exports = stripeApiObj;