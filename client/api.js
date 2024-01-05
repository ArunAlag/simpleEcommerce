import axios from "axios";

//('http://localhost:3000/<page_name>)
let apiInstance = axios.create({
    baseURL: 'https://simpleecommerce-backend.onrender.com',
    withCredentials: true,
}) 

// Strip Instance
let stripe = Stripe(process.env.STRIPE_PUBLIC_KEY);


export async function downloadAll(email) {
    return apiInstance.post('/download-all', {email})
    .then(res => alert(res.data.message))
    .catch(res => alert(res.data.message))
}

export async function getItems() {
    let responds = await apiInstance.get('/items')

    return responds.data;
}

export async function purchaseItem(itemId) {
    apiInstance.post('/create-checkout-session', {
        itemId
    })
    .then((res) => {
        return stripe.redirectToCheckout({sessionId: res.data.id});
    })
    .then((result) => {
        if(result.error) {
            alert(result.error.message)
        }
    })
    .catch((error) => {
        alert(error)
    })
}

export function downloadItem(itemId) {
    return apiInstance.post('/download-email', {itemId})
    .then(res => alert(res.data.message))
    .catch(res => alert(res.data.message))
}