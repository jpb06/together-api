﻿import * as debug from 'debug';
import * as express from 'express';
import { Express, Response } from "express-serve-static-core";
import * as bodyParser from "body-parser"; // pull information from HTML POST (express4)
import * as cors from 'cors';

import { mapSecurityRoutes } from './api/routes/security.routes.js';
import { extendsImplementation } from './api/middleware/extends.implementation.middleware';

import { apiConfig } from './config/api.config.interface';

import { DalConfiguration } from './dal/configuration/dal.configuration';
import { Configuration as RsaStoreConfiguration } from 'rsa-vault';
import { mapUserRoutes } from './api/routes/user.routes.js';
import { mapDefaultRoutes } from './api/routes/default.routes.js';

DalConfiguration.Setup(apiConfig());
RsaStoreConfiguration.Setup(apiConfig());

let app: Express = express();
app.use(cors({
    origin: (apiConfig()).srvURLs,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(extendsImplementation);

mapDefaultRoutes(app);
mapSecurityRoutes(app);
mapUserRoutes(app);

app.set('port', 3001);

var server = app.listen(app.get('port'), apiConfig().expressListeningIPAddress, function () {
    debug('Express server listening on port ' + server.address().port);
});