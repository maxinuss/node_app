# test_nodejs

## Summary

The test consist on the development of 2 Node JS Apps that will interact between them. One
application must be a public and a private API that also manages the interaction with a
MongoDB database (this app will be called Ganymede). The other application (which will be
called Themisto) must be a simple NodeJS app with Puppeteer, that will be in charge of
crawling provider's websites on demand.
We suggest using the following NPM modules to develop your apps:
- Koa JS for the server: https://koajs.com/
- Mongoose to interact with the Database: https://github.com/Automattic/mongoose
- Puppeteer for the crawling: https://github.com/GoogleChrome/puppeteer

This app consist on 2 workers Ganymede and Themisto.
You can run each one from them folder.

## Goal
The goal is having an app that will work as an on demand product crawler, with the following
public API:
POST /api/product/search
This endpoint will receive an object with the terms for a search, as follows next:
``` 
{
searchQuery: 'Sillas',
provider: 'easy',
options: {
user: '[a username],
password: '[the password]'
},
callbackUrl: 'http://my-endpoint.com/results'
} 
```
Where:
- searchQuery​ is a text to search
- provider​ is a key that defines on which provider the search must be on
- options​ are particular options for the provider, such as user and password
- callbackUrl​ receive processed result.

The endpoint is in charge of generating a "Search Order", which consists of an object containing
the search data received in the request, a status (that may be "received", "processing", "failed"
or "processed") and an array with all the products found by this search.
It must respond with the ID of the generated order, after validating that all the received data is
correct.

``` GET /api/product/search-order/{searchOrderId} ```
This endpoint will receive a searchOrderId as a query string, and must return a JSON with the
status of the searchOrder and the results associated to the search order itself.

``` GET /api/product/search-order/list ```
This endpoint will return a list of the search orders that exists in the database.

``` GET /api/product/category/{productCategoryId} ```
This endpoint will receive a categoryId as a query string, and must return an array with all the
products associated to the given category. If the category doesn't exists, it must return an error.

## The flow
- A request is received in the Ganymede endpoint "/api/product/search", and a new search
order is created with status received. 
- The main app must make a request to Themisto, so it can start crawling the website of the required provider. 
- When the request is accepted by Themisto, the status of the search order must be changed to "processing".
- Themisto will handle the website crawling and it's objective is logging in with the user and
password passed (fail and notify if there's a login error) and getting ALL the products found with
the search term passed in the first request. Once this is made, Themisto will report this products
to a private API in Ganymede (using a token as authentication).

- Each product must be saved by Ganymede in the Mongo DB, containing the next properties:
  - The used search term
  - Title / Product name
  - SKU
  - Price
  - Price with discount (if there's any)
  - Description (if there's any)
  - Array with the images URL

- After all the products are reported to Ganymede, the search order status must be changed to
"processed". If for some reason there's an error, the new status must be "failed".
- Finally, when the search order status is updated, Ganymede must make a request to the
callbackUrl reporting the new status + the URL of the API to get all the order data.

## Additional notes
The provider we recommend you to use for this test is Easy (http://easy.com.ar/). Feel free to
use eBay, Amazon, MercadoLibre or other eCommerces if you want to. You must create a test
account and pass it to us on the repository README).
All the work must be saved in a Github repository, with a guide on how to use it. Before
starting this test, we ask you to submit a simple schedule with estimations for each part
of this test, and also a date where you think you may present this finished to us.
The endpoints must be delivered in a POSTman file, so we can test your app.

### Developer notes:

- Selected provider: easy
- User & Password provided in the e-mail.

### Run the application

#### Requirements
You will need:
- Node 10

1) copy .env.example to .env in each folder
2) replace all values you need
3) npm install in each folder
4) npm start in each folder

#### Endpoints


Ganymede url: ``` http://localhost:3067 ```

Themisto url: ``` http://localhost:3068 ```
