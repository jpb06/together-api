import { Express } from "express-serve-static-core";
import { UsersStore } from "../../dal/manipulation/stores/specific/users.store";

export function mapDefaultRoutes(app: Express) {
    app.get('/', (req, res) => {
        res.send('Valid routes are in /api');
    });
    app.get('/api/', (req, res) => {
        res.send('Together api.');
    });
    app.get('/api/test', async (req, res) => {
        try {
            const user = await UsersStore.getByEmail('jpb.06@outlook.fr');
            if (user) {
                res.populate(user.lastName);
            } else {
                res.send('Unable to find user');
            }
        } catch (error) {
            return res.answer(500, error.message);
        }
    });
};