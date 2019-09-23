import { Express, Request, Response } from "express-serve-static-core";
import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';
import { VaultService, Types } from 'rsa-vault';
import { UsersStore } from './../../dal/manipulation/stores/specific/users.store';
import * as CryptoUtil from './../../business/util/crypto.util';

export function mapSecurityRoutes(app: Express) {

    app.post('/api/login', async (
        req: Request,
        res: Response
    ) => {
        try {
            if (!req.validateLogin()) {
                return res.answer(400, 'Expecting identifiers');
            }

            let user = await UsersStore.get(req.body.login);
            if (user === undefined) return res.status(401).json({
                status: 401,
                data: null
            });

            let isPasswordValid = await CryptoUtil.verify(req.body.password, user.password)
            if (isPasswordValid) {
                let applicationKeys: Types.ApplicationKeys = await VaultService.GetKeyPair('together');

                let gracePeriod = req.body.expiresIn || 120;
                let expirationDate = moment().add(gracePeriod, 'seconds');

                const jwtBearerToken = jwt.sign({ guild: req.body.login }, applicationKeys.privateKey, {
                    algorithm: 'RS256',
                    expiresIn: gracePeriod
                });

                return res.status(200).json({
                    status: 200,
                    token: jwtBearerToken,
                    expirationDate: JSON.stringify(expirationDate)
                });
            } else {
                return res.status(401).json({
                    status: 401,
                    data: null
                });
            }
        } catch (error) {
            console.log(error);
            return res.answer(500, error.message);
        }
    });
}