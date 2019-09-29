import { Express, Request, Response } from "express-serve-static-core";
import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';
import { VaultService, Types } from 'rsa-vault';
import { UsersStore } from '../../dal/manipulation/stores/specific/users.store';
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

            const user = await UsersStore.get(req.body.login);
            if (user === undefined) return res.status(401).json({
                status: 401,
                data: null
            });

            const isPasswordValid = await CryptoUtil.verify(req.body.password, user.password)
            if (isPasswordValid) {
                const applicationKeys: Types.ApplicationKeys = await VaultService.GetKeyPair('together');

                const expirationDate = moment().add(20, 'minutes');

                const jwtBearerToken = jwt.sign({
                    email: req.body.login
                }, applicationKeys.privateKey, {
                    algorithm: 'RS256',
                    expiresIn: '20m'
                });

                user.session = {
                    expirationDate: expirationDate.toDate()
                };

                let result = await UsersStore.Update(user);
                if (result) {
                    return res.status(200).json({
                        status: 200,
                        token: jwtBearerToken,
                        user: {
                            email: user.email,
                            lastname: user.lastName,
                            firstname: user.firstName,
                            avatar: user.avatarName,
                            teams: user.teams,
                        },
                        expirationDate: expirationDate.toISOString()
                    });
                } else {
                    return res.status(500).json({
                        status: 500,
                        data: 'Unable to set user session'
                    });
                }
                
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