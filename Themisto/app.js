// load .env file config
require('dotenv').config();

const Koa = require('koa');
const Router = require('koa-router');
const app = new Koa();
const router = new Router();
const BodyParser = require("koa-bodyparser");
const rp = require('request-promise');

const PORT = process.env.PORT;
const TOKEN = process.env.TOKEN;
const GANYMEDE_URL = process.env.GANYMEDE_URL;

//controllers
const easyProvider = require('./providers/easyProvider/easyProvider');

const providers = { 'easy': easyProvider };

app.use(BodyParser());

router.post('/api/crawler/start', async (ctx, next) => {
  //@TODO: Improve this auth method =-)
  if(ctx.request.headers.token != TOKEN) {
    ctx.status = 401;
    return;
  }

  if (ctx.request.rawBody) {
    let order = ctx.request.body;

    try {
      providers[order.provider].getProducts(order);

      await ganymedeNotify(order);

      ctx.status = 200;
    } catch (e) {
      console.log('Provider: ', order.provider);
      console.log(e);
      ctx.status = 404;
    }
  } else {
    ctx.status = 400;
  }
});

async function ganymedeNotify(order)
{
  await rp({
    method: 'GET',
    url: GANYMEDE_URL + '/api/notify/' + order._id,
    headers: { 'content-type': 'application/json', 'token': TOKEN },
  }).then(function () {
    console.log('####### Notification to ganymede sent ######');
  }).catch(function (err) {
    console.log('##### Notification to ganymede  failed ######', err);
  });
}

app.use(router.routes());
app.use(router.allowedMethods());
app.listen(PORT);