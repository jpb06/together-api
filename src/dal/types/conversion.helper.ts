import { TerseUser, User } from "./persisted.types";

const userToTerseUser = (
    user: User
): TerseUser => ({
    _id: user._id,
    lastName: user.lastName,
    firstName: user.firstName,
    avatarName: user.avatarName
});

export {
    userToTerseUser
};