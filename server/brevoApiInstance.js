let axios = require('axios');

module.exports = axios.create({
    baseURL: 'https://api.brevo.com/v3',
    headers: {'api-key': process.env.BREVO_API_KEY}
})