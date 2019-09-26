import { Express, Request, Response } from "express-serve-static-core";

export function mapDefaultRoutes(app: Express) {
    app.get('/', (req, res) => {
        res.send('Valid routes are in /api');
    });
    app.get('/api/', (req, res) => {
        res.send('Together api.');
    });
};