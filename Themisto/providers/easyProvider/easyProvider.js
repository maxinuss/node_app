'use strict';

const puppeteer = require('puppeteer');
const rp = require('request-promise');

const TOKEN = process.env.TOKEN;
const GANYMEDE_URL = process.env.GANYMEDE_URL;

/**
 * Get provider products
 * @param order
 * @returns {Promise<void>}
 */
exports.getProducts = async (order) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  let user = order.options[0].user;
  let pass = order.options[0].password;
  let term = order.query;
  let orderId = order._id;

  console.log('Let\'s rock baby!');
  console.log('url: ', GANYMEDE_URL);

  let logged = await login(page, user, pass);
  console.log(logged);

  if (logged) {
    await search(page, term);
    await searchProducts(page, term, orderId);
  }

  await browser.close();
};

/**
 * Login to provider
 * @param page
 * @param user
 * @param pass
 * @returns {Promise<boolean>}
 */
async function login(page, user, pass)
{
  await page.goto('https://www.easy.com.ar/webapp/wcs/stores/servlet/es/AjaxLogonForm?catalogId=10051&myAcctMain=1&langId=-5&storeId=10151', { waitUntil: 'networkidle0' });

  await page.type('#WC_AccountDisplay_FormInput_logonId_In_Logon_1', user);
  await page.type('#WC_AccountDisplay_FormInput_logonPassword_In_Logon_1', pass);
  await page.click('#WC_AccountDisplay_links_2');

  await page.waitForNavigation();
  const pageTitle = await page.title();

  if(pageTitle === 'Iniciar sesión') {
    console.log('No se pudo loguear.');
    await notifyLoginFail(user, pass);

    return false;

  } else {
    console.log('Logged');
    return true;
  }
}

/**
 * Search term in provider
 * @param page
 * @param term
 * @returns {Promise<void>}
 */
async function search(page, term)
{
  await page.goto('https://www.easy.com.ar/webapp/wcs/stores/servlet/es/SearchDisplay?storeId=10151&catalogId=10051&langId=-5&pageSize=12&beginIndex=0&searchSource=Q&sType=SimpleSearch&resultCatEntryType=2&showResultsPage=true&pageView=image&searchTerm=' + term, {waitUntil : "networkidle0"});
  await page.evaluate(() => { window.scrollBy(0, window.innerHeight); });

  console.log('search applied');
}

/**
 * Look for products
 * @param page
 * @param term
 * @param orderId
 * @returns {Promise<void>}
 */
async function searchProducts(page, term, orderId) {
  await page.waitForSelector('#Search_Result_div');
  const categoryList = await page.$$('#Search_Result_div .thumb-product');

  console.log('Retrieving product list...');
  console.log('Productos encontrados: ' + categoryList.length);

  let response = await getProductInfo(categoryList, term, orderId);
  await notify(response);
}

/**
 * Get info about products
 * @param list
 * @param term
 * @param orderId
 * @returns {Promise<{orderId: *, products: Array}>}
 */
async function getProductInfo(list, term, orderId)
{
  let products = [];

  for (let p of list) {
    let name = await p.$eval('.thumb-name', item => item.innerText);
    console.log('Name: ', name);

    let sku = await p.$eval('.thumb-img img', (item) => {
      return item.src.split('/').pop();
    });
    console.log('SKU: ', sku);

    let image = await p.$eval('.thumb-img img', (item) => {
      return item.src;
    });
    console.log('Image: ', image);

    let price = await p.$eval('.thumb-price .thumb-price-e', (item) => {
      return trim(item.innerText);
    });
    console.log('price: ', price);

    let discountPrice = 0;
    try {
      discountPrice = await p.$eval('.thumb-price-mas', (item) => {
        return trim(item.innerText);
      });
    } catch (e) {
    }
    console.log('discountPrice: ', discountPrice);

    products.push({
      query: term,
      title: name,
      sku: sku,
      price: price,
      price_with_discount: discountPrice,
      description: name,
      category: term,
      images: [image],
    });

    console.log('#############');
    console.log('#############');
  }

  return { orderId: orderId, products: products }
}

/**
 * Notify products to Ganymede
 * @param response
 * @returns {Promise<void>}
 */
async function notify(response)
{
  console.log('Sending notification', JSON.stringify(response));

  rp({
    method: 'POST',
    url: GANYMEDE_URL + '/api/product',
    headers: { 'content-type': 'application/json', 'token': TOKEN },
    body: JSON.stringify(response)
  }).then(function () {
    console.log('####### Notification sent ######');
  }).catch(function (err) {
    console.log('##### Notification failed ######', err);
  });
}

async function notifyLoginFail(user, pass)
{
  console.log('Sending login fail notification', JSON.stringify({user: user, pass: pass}));

  rp({
    method: 'POST',
    url: GANYMEDE_URL + '/api/login-fail',
    headers: { 'content-type': 'application/json', 'token': TOKEN },
    body: JSON.stringify({user: user, pass: pass})
  }).then(function () {
    console.log('####### Login fail Notification sent ######');
  }).catch(function (err) {
    console.log('##### Login fail Notification failed ######', err);
  });
}