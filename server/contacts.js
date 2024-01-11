let apiInstance = require('./brevoApiInstance');
let items = require('./items.json');

// Create a contact
async function linkContactAndItem(email, {listId}) {
    let contact = await getContact(email);
    console.log("linkContactAndItem is called")
    if(contact == null) {
        return createContact(email, listId);
    } else {
        return updateContact(contact.id, listId)
    }
}

async function getContactPurchasedItems(email) {
    console.log("Email in getContactPurchasedItems: ", email)
    if(email == null) return [] 

    let contact = await getContact(email)
    console.log("Contact info: ", contact)
    if(contact == null) return []
    console.log("Contact listIds: ", contactListIds);
    return items.filter(item => contact.listIds.includes(item.listId))

}

function getContact(emailOrId) {
    return apiInstance.get(`/contacts/${emailOrId}`)
    .then((res) => res.data)
    .catch((error) => {
        if(error.response.status === 404) return null
        throw error
    })
}

function createContact(email, listId) {
    return apiInstance.post(`/contacts`, {
        email,
        listIds: [listId]
    })
}

function updateContact(emailOrId, listId) {
    return apiInstance.put(`/contacts/${emailOrId}`,{
        listIds: [listId]
    })
}

module.exports = {linkContactAndItem, getContactPurchasedItems}