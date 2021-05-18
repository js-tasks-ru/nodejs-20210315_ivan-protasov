const path = require('path');
const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

let subscribers = [];

router.get('/subscribe', async (ctx) => {
  const dataToSend = await new Promise((resolve)=>{
    subscribers.push(resolve);
  });

  ctx.body = dataToSend;
});

router.post('/publish', async (ctx) => {
  if (!ctx.request.body.message) {
    ctx.status= 406;
    return ctx.body= 'Empty string is not valid';
  }
  subscribers.forEach((resolve) => resolve(ctx.request.body.message));
  subscribers = [];
  ctx.body= 'send';
});

app.use(router.routes());

module.exports = app;
