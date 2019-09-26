declare namespace Express {
    export interface Request {
        validateLogin: () => boolean;

        validateUnforeseen: () => boolean;

        validateUser: () => boolean;
    }
}