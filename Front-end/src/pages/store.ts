export interface IUserData {
	id: number | string | null;
	email: string | null;
	username: string | null;
	profileImage: string | null;
	bio: string | null;
}

export const userData : IUserData = {
	id: null,
	email: null,
	username: null,
	profileImage: null,
	bio: null,
};

export function setUserData(newData: IUserData)
{
	Object.assign(userData, newData);
}

export function getUserData(): IUserData
{
	return userData;
}
