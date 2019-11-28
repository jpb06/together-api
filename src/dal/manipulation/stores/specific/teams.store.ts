import { GenericStore } from '../dal.generic.store';
import { Team, TeamMember, InvitedUser, MembershipRequest } from '../../../types/persisted.types';
import { ObjectId } from 'bson';

export abstract class TeamsStore {
    public static storeName = 'teams';

    public static async create(
        name: string
    ): Promise<ObjectId | undefined> {

        const insertedId = await GenericStore.create(this.storeName, {
            name: name, 
            members: [],
            invitedUsers: [],
            membershipRequests: []
        });
        return insertedId;
    }

    public static async get(
        id: ObjectId
    ): Promise<Team | undefined> {

        const result = await GenericStore.getBy(
            this.storeName,
            { _id: id },
            {}) as Array<Team>;

        if (result.length !== 1) return undefined;

        return result[0];
    }

    public static async getByName(
        name: string
    ): Promise<Team | undefined> {

        const result = await GenericStore.getBy(
            this.storeName,
            { name: name },
            {}) as Array<Team>;

        if (result.length !== 1) return undefined;

        return result[0];
    }

    public static async GetTeamMembers(
        teamId: ObjectId
    ): Promise<Array<TeamMember> | undefined> {

        const team = await this.get(teamId);
        if (team) {
            return team.members;
        }
        else {
            return undefined;
        }
    }

    public static async GetTeamInvitedUsers(
        teamId: ObjectId
    ): Promise<Array<InvitedUser> | undefined> {

        const team = await this.get(teamId);
        if (team) {
            return team.invitedUsers;
        }
        else {
            return undefined;
        }
    }

    public static async GetTeamMembershipRequests(
        teamId: ObjectId
    ): Promise<Array<MembershipRequest> | undefined> {

        const team = await this.get(teamId);
        if (team) {
            return team.membershipRequests;
        }
        else {
            return undefined;
        }
    }

    public static async getUserTeams(
        userId: ObjectId
    ): Promise<Array<Team>> {

        const teams = await GenericStore.getBy(
            this.storeName,
            { 'members': { $elemMatch: { _id: userId } } },
            {}
        ) as Array<Team>;

        return teams;
    }

    public static async exists(
        name: string
    ): Promise<boolean> {

        const result = await GenericStore.getBy(
            this.storeName,
            { name: name },
            {}) as Array<Team>;

        if (result.length === 1) return true;

        return false;
    }

    public static async addUserToTeam(
        teamId: ObjectId,
        user: TeamMember
    ): Promise<boolean> {

        const result = await GenericStore.getBy(
            this.storeName,
            { _id: teamId },
            {}) as Array<Team>;

        if (result.length === 1) {
            result[0].invitedUsers = result[0].invitedUsers.filter(el => !el.invitee._id.equals(user._id));
            result[0].membershipRequests = result[0].membershipRequests.filter(el => !el.user._id.equals(user._id));

            result[0].members.push(user);
            const persistedTeam = await GenericStore.createOrUpdate(this.storeName, { _id: teamId }, result[0]);
            if (persistedTeam) {
                return true;
            }
        }

        return false;
    }

    public static async Update(
        team: Team
    ): Promise<boolean> {

        const result = await GenericStore.createOrUpdate(
            this.storeName,
            { _id: team._id },
            team
        );

        return result ? true : false;
    }
}