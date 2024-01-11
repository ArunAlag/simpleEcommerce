const SERVER_URL = process.env.SERVER_URL;
// const SERVER_URL = 'https://simpleecommerce-backend.onrender.com';
let apiInstance = require('./brevoApiInstance');

function sendDownloadLink(email, downloadlinkCode, item) {
    let downloadLink = `${SERVER_URL}/download/${downloadlinkCode}`
    return sendEmail({email,
        subject: `Download ${item.name}`,
        htmlContent: `
        <h1> Thank you for purchasing ${item.name} </h1>

        <a href="${downloadLink}"> Download it now </a>
        `,
        textContent: `Thank you for purchasing ${item.name} Download it now. ${downloadLink}`
    })
}

function sendAllDownloadLinks(email, downloadableItems) {
    if(downloadableItems.length === 0) return

    return sendEmail({email, subject: "Download Your Files",
     htmlContent: downloadableItems.map(({item, code}) => {
        return `<a href="${SERVER_URL}/download/${code}">Download ${item.name} </a>`
     }).join('<br>'),
     textContent: downloadableItems.map(({item, code}) => {
        return `Download ${item.name} ${SERVER_URL}/download/${code}`
     }).join('<br>'),
    })
}

function sendEmail({email, ...options}) {
    let sender = {
        name: 'Arun Alag',
        email: 'arunalag3003@gmail.com'
    }
    return apiInstance.post('/smtp/email', {
        sender,
        replyTo: sender,
        to: [{email}],
        ...options
    })
}

module.exports = {sendDownloadLink, sendAllDownloadLinks};