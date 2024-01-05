import {getItems, purchaseItem, downloadItem, downloadAll} from './api'

// Select the DOM elements 
let itemList = document.querySelector('[data-item-list]');
let template = document.querySelector('#item-template');
let emailForm = document.querySelector('[data-email-form]');
let emailInput = document.querySelector('[data-email-input]');
let body = document.querySelector('body')


emailForm.addEventListener('submit',async (e) => {
    e.preventDefault();
    await downloadAll(emailInput.value);

    window.location = window.location
})

async function loadItems() {
    console.log("Loading Items")
    // Get the items from API
    let items = await getItems();

    console.log(items)
    // Ensure the page is clean
    itemList.innerHTML = '';

    // Populate items in page
    items.forEach((item) => {
        // clone template that will be used to populate the page
        let clone = template.content.cloneNode(true);
        let itemName = clone.querySelector('.item-name');
        let itemPrice = clone.querySelector('.item-price');
        let itemButton = clone.querySelector('.purchase-btn');

        itemName.textContent = item.name;
        itemPrice.textContent = `$${item.price}`;
        
        if(item.purchased) {
            itemButton.classList.add('download-btn');
            itemButton.textContent = 'download';
            itemButton.addEventListener('click', () => {
                downloadItem(item.id)
            })
        } else {
            itemButton.classList.add('purchase-btn');
            itemButton.textContent = 'purchase'
            itemButton.addEventListener('click', () => {
                purchaseItem(item.id)
            })
        }

        itemList.append(clone)
    })

    return items
}

loadItems()
