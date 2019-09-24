﻿/* ---------------------------------------------------------------------------------------------------------------
   Persisted
   ---------------------------------------------------------------------------------------------------------------*/
export class User {
    email: string;
    password: string;
    session: Session;
    teams: Array<Team>;
}

/* ---------------------------------------------------------------------------------------------------------------
   Subsets
   ---------------------------------------------------------------------------------------------------------------*/
export class Session {
    expirationDate: string;

}
export class Team {
    name: string;
}