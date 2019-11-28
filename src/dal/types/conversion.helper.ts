import { TerseUser, User, BareTeam, Team } from "./persisted.types";

const userToTerseUser = (
    user: User
): TerseUser => ({
        _id: user._id,
        lastName: user.lastName,
        firstName: user.firstName,
        avatarName: user.avatarName
    });

const TeamToBareTeam = (
    team: Team
): BareTeam => ({
        _id: team._id,
        name: team.name
});


export {
    userToTerseUser,
    TeamToBareTeam
};