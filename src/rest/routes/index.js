import { test } from '../controllers/test';

export const setupRoutes = (app) => {
    app.get('/url', test);
};
