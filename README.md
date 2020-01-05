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
``` {
searchQuery: 'Sillas',
provider: 'easy',
options: {
user: '[a username],
password: '[the password]'
},
callbackUrl: 'http://my-endpoint.com/results'
} ```

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
