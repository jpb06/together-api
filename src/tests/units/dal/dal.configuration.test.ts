import { DalConfiguration } from "../../../dal/configuration/dal.configuration";

describe('Setup & verify', () => {
    it('should verify with no errors', async () => {
        DalConfiguration.Setup({
            srvIPAddress: 'localhost',
            mongodbPort: 27017,
            mainDb: 'test',
            mainDbUsername: 'testusr',
            mainDbPassword: 'testo'
        });

        expect(DalConfiguration.VerifyDatabaseConfig()).toBeUndefined();
    });

    it('should warn about invalid url', async () => {
        DalConfiguration.Setup({
            srvIPAddress: '',
            mongodbPort: 27017,
            mainDb: 'test',
            mainDbUsername: 'testusr',
            mainDbPassword: 'testo'
        });

        expect(() => DalConfiguration.VerifyDatabaseConfig()).toThrow('Invalid url specified to access mongodb instance');
    });

    it('should warn about missing dbase', async () => {
        DalConfiguration.Setup({
            srvIPAddress: 'localhost',
            mongodbPort: 27017,
            mainDb: '',
            mainDbUsername: 'testusr',
            mainDbPassword: 'testo',
        });

        expect(() => DalConfiguration.VerifyDatabaseConfig()).toThrow('No database specified');
    });
});




