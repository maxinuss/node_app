// load .env file config
require('dotenv').config();

const Koa = require('koa');
const Router = require('koa-router');
const rp = require('request-promise');
const app = new Koa();
const router = new Router();
const BodyParser = require("koa-bodyparser");
const mongoose = require('./db');

const PORT = process.env.PORT;
const TOKEN = process.env.TOKEN;
const GANYMEDE_URL = process.env.GANYMEDE_URL;
const THEMISTO_URL = process.env.THEMISTO_URL;

//models
const SearchOrder = require('./model/SearchOrder/SearchOrder');
const Category = require('./model/Category/Category');
const Product = require('./model/Product/Product');

app.use(BodyParser());

//BIG TODO: This structure is just with example purposes and can be improved.

router.post('/api/product/search', async (ctx, next) => {
  //@TODO: validate required fields
  //@TODO: do not create duplicated orders
  if(ctx.request.rawBody) {
    let orderFields = {
      query: ctx.request.body.searchQuery,
      options: ctx.request.body.options,
      provider: ctx.request.body.provider,
      callbackUrl: ctx.request.body.callbackUrl,
      status: 'received​'
    };

    let order = await new SearchOrder(orderFields).save();
    await themistoNotify(order);

    ctx.status = 201;
    ctx.response.body = {
      id: order.id
    };

  } else {
    ctx.status = 400;
  }
});

router.get('/api/product/search-order/list', async (ctx, next) => {
  let orders = await SearchOrder.findAll();

  if(orders) {
    ctx.status = 200;
    ctx.response.body = {
      orders
    };
  } else {
    ctx.status = 404;
  }
});

router.get('/api/product/search-order/:id', async (ctx, next) => {
  let order = await SearchOrder.findById(ctx.params.id);

  if(order) {
    ctx.status = 200;
    ctx.response.body = {
      order
    };
  } else {
    ctx.status = 404;
  }
});


router.get('/api/product/category/:id', async (ctx, next) => {
  let products = await Product.find({category: ctx.params.id});

  if(products.length !== 0) {
    ctx.status = 200;
    ctx.response.body = {
      products
    };
  } else {
    ctx.status = 404;
  }
});

/**
 * Notification from Themisto endpoint
 */
router.post('/api/product', async (ctx, next) => {

  console.log("Notification received");

  if(ctx.request.rawBody) {
    //@TODO: Improve this auth method =-)
    if(ctx.request.headers.token != TOKEN) {
      console.log("Ivalid token");
      ctx.status = 401;
      return;
    }

    let data = ctx.request.body;
    let order = await SearchOrder.findById(data.orderId);

    try {
      for (let p of data.products) {
        let category = await Category.find({name: p.category});
        if (category.length === 0) {
          category = await new Category({name: p.category}).save();
        }

        p.category = category.id;
        await new Product(p).save();
      }

      order.status = 'processed';
      order.save();
      await doCallback(order);

      ctx.status = 201;
      console.log("Notification processed");
    } catch (e) {
      order.status = 'failed';
      order.save();
      await doCallback(order);
    }
  } else {
    ctx.status = 404;
    console.log("Error");
  }
});

router.get('/api/notify/:id', async (ctx, next) => {
  let order = await SearchOrder.findById(ctx.params.id);
  order.status = 'processing';
  order.save();

  console.log('Processing order');

  if(order.length !== 0) {
    ctx.status = 200;
  } else {
    ctx.status = 404;
  }
});

router.post('/api/login-fail', async (ctx, next) => {
  console.log('Login fail notification received');
  //do something...
  ctx.status = 200;
});

/**
 * Notify to Themisto
 * @param order
 * @returns {Promise<void>}
 */
async function themistoNotify(order)
{
  await rp({
    method: 'POST',
    url: THEMISTO_URL + '/api/crawler/start',
    headers: { 'content-type': 'application/json', 'token': TOKEN },
    body: JSON.stringify(order)
  }).then(function () {
    console.log('####### Notification send ######');
  }).catch(function (err) {
    console.log('##### Notification failed ######', err);
  });
}

async function doCallback(order)
{
  rp({
    method: 'POST',
    url: order.callbackUrl,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      apiUrl: GANYMEDE_URL + '/api/product/search-order/' + order._id,
      status: order.status
    })
  }).then(function () {
    console.log('####### Callback send ######');
  }).catch(function (err) {
    console.log('##### Callback failed ######', err.statusCode);
  });
}

app.use(router.routes());
app.use(router.allowedMethods());
app.listen(PORT);