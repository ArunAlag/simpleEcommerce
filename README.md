# JavaScript REST API application Example Project

## A fully functional Simple Ecommerce project written primarily in JavaScript showing how to integrate multiple API seamlessly to and create a Eccommerce Site

This projects aims accomplish few goals:

- Create a email based login system using Brevo API
- Create a functional payment system using Stripe Payment API

### How the project flows?

#### New User

- The user can click on the particular course they want
- They will be redirected to the stripe payment gateway to complete the payment
- Once the payment is complete, user will be redirected to the success page and an email will be sent to the user to download the files
- This files however is a text based file since this is just a demo example

#### Repeat User

- If the user have alrady bought the course, they can simply login using the email they used to purchase the course
- Once the login is successful, user can see the download button for the particular course
- If the user click the download button, they will get email attachment with the file
