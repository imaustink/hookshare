import Koa from 'koa';
import { koaBody } from 'koa-body';

const app = new Koa();

app.use(koaBody());

app.use(async (ctx) => {
  console.log(ctx.request.body);
  ctx.body = {
    status: 'OK',
  };
});

app.listen(8080, () => console.log('Listening...'));
