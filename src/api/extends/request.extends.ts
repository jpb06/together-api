declare namespace Express {
    export interface Request {
        validateLogin: () => boolean;

        validateUnforeseen: () => import("./../../dal/types/internal.types").UnforeseenData | undefined;
        validateDailyPredicate: () => import("./../../dal/types/internal.types").DailyPredicate | undefined;
        validateUser: () => boolean;
    }
}