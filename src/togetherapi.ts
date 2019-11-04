import * as debug from 'debug';
import * as express from 'express';
import { Express, Response } from "express-serve-static-core";
import * as bodyParser from "body-parser"; // pull information from HTML POST (express4)
import * as cors from 'cors';

import { mapDefaultRoutes } from './api/routes/default.routes.js';
import { mapSecurityRoutes } from './api/routes/security.routes.js';
import { mapUserRoutes } from './api/routes/user.routes.js';
import { mapDailyRoutes } from './api/routes/daily.routes';
import { extendsImplementation } from './api/middleware/extends.implementation.middleware';
import { mapTeamRoutes } from './api/routes/team.route.js';

import { apiConfig } from './config/api.config.interface';

import { DalConfiguration } from './dal/configuration/dal.configuration';
import { Configuration as RsaStoreConfiguration } from 'rsa-vault';

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
app.use((req, res, next) => setTimeout(next, 500));

mapDefaultRoutes(app);
mapSecurityRoutes(app);
mapUserRoutes(app);
mapDailyRoutes(app);
mapTeamRoutes(app);

app.set('port', 3002);

var server = app.listen(app.get('port'), apiConfig().expressListeningIPAddress, function () {
    debug('Express server listening on port ' + server.address().port);
});