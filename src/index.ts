import express, { Express } from 'express';
import { config } from './config';
import { setup } from './setup/setup';

const app: Express = express();

(async () => {

    await setup(app);

    const port = config.port || 8000;

    app.listen(port, () => { console.log(`Server connected on port ${port}`) });

})();
