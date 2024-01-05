// Package Imports 
require('dotenv').config();
let express = require('express');
let cors = require('cors'); // [Needed so that client side script can talk to backend]
let cookieParser = require('cookie-parser');
let stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
let {v4: uuidV4} = require('uuid');

// Local imports 
let items = require('./items.json'); // [Local DB]
let {sendDownloadLink, sendAllDownloadLinks} = require('./mailer');
let { linkContactAndItem, getContactPurchasedItems } = require('./contacts');

// Constants
const DOWNLAOD_LINK_EXPIRATION_TIME = 10 * 60 * 1000; // 10 minutes expiration time
const COOKIE_EXPIRATION = 30 * 24 * 60 * 60 * 1000 // 30 days
const PORT = 3000;
const SERVER_URL = 'https://simpleecommerce-backend.onrender.com';
const CLIENT_URL = 'http://localhost:1234';

// Initiate

let app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({
    credentials: true,
    origin: CLIENT_URL
}))
app.use(cookieParser());

// Mapping
let downloadLinkMap = new Map()

// Routes
app.get('/items', async (req,res) => {
   
    let email = req.cookies.email;
    let purchasedItemIds = (await getContactPurchasedItems(email)).map((item) => item.id)
    res.json(items.map((item) => {
        return {
            id:item.id,
            name: item.name,
            price: item.priceInCents / 100,
            purchased: purchasedItemIds.includes(item.id)
        }
    }))
})

// Download content
app.post('/download-email', (req,res) => {
    let email = req.cookies.email;
    let itemId = req.body.itemId;
    let code = createDownloadCode(itemId)

    sendDownloadLink(email, code, items.find((item) => item.id  === parseInt(itemId)))
    .then(() => {
        res.json({message: "Check your email"})
    })
    .catch(() => {
        res.status(500).json({message: "Error, please try again"})
    })
})

app.post('/download-all', async(req,res) => {
    let email = req.body.email;
    let items = await getContactPurchasedItems(email);
    setEmailCookie(res, email);
    sendAllDownloadLinks(email,items.map(item => {
        return {item, code: createDownloadCode(item.id)}
    }))

    return res.json({message: "Check your email for download link"});
})


// Stripe server code
app.post('/create-checkout-session', async (req, res) => {
    let item = items.find((item) => item.id === parseInt(req.body.itemId))
    const session = await createCheckoutSession(item)
    res.json({id: session.id})
});

function createCheckoutSession(item) {
    return stripe.checkout.sessions.create({
        // To add any other requirements, go to https://stripe.com/docs/api/checkout/sessions/create
        line_items: [
          {
            price_data: {
              currency: 'myr',
              product_data: {
                name: item.name,
              },
              unit_amount: item.priceInCents,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${SERVER_URL}/purchase-success?itemId=${item.id}&sessionId={CHECKOUT_SESSION_ID}`,
        cancel_url: CLIENT_URL,
    });
}

// Success Process 
app.get('/purchase-success', async (req,res) => {
    // Get the item id 
    let item = items.find((item) => item.id === parseInt(req.query.itemId))
    // Retrieve the email from the session
    let {customer_details: {email}} = await stripe.checkout.sessions.retrieve(req.query.sessionId);

    setEmailCookie(res, email)

    // Add the user to the email list
    linkContactAndItem(email, item);

    // Create the download code for the user
    let downloadLinkCode = createDownloadCode(item.id);

    // Send user the download link
    sendDownloadLink(email, downloadLinkCode, item);

    res.redirect(`${process.env.CLIENT_URL}/download-links.html`);
})

function setEmailCookie(res, email) {
    res.cookie("email", email, {
            httpOnly: true,
            secure: true,
            maxAge: COOKIE_EXPIRATION
        }
    )
}

function createDownloadCode(itemId) {
    let downloadId = uuidV4()
    downloadLinkMap.set(downloadId, itemId)

    // Expire the link after sometime
    setTimeout(() => {
        downloadLinkMap.delete(downloadId);
    }, DOWNLAOD_LINK_EXPIRATION_TIME)

    return downloadId;
}

// Download link
app.get('/download/:code',(req,res) => {
    let itemId = downloadLinkMap.get(req.params.code);

    if(itemId == null) {
        return res.send("This link is not valid or invalid")
    }

    let item = items.find((item) => item.id === itemId)

    if(item == null) {
        return res.send("This item could not be found");
    }

    downloadLinkMap.delete(req.params.code);

    res.download(`downloads/${item.file}`);
})


// Listen
app.listen(PORT, () => {
    console.log("listenting to port")
})