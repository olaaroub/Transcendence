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

 /// had function adds /api prefix only if its not already there ( to prevent /api/api and if mmondad uses profile photo online
 // for example https://profilephoto) and i used it here 7itach simo tayloadi profile photo f b<f tlblays
 // so i should make a function to call mra w7da l kolchi
export function getImageUrl(profileImage: string | null | undefined): string | null {
	if (!profileImage) return null;
	return profileImage.startsWith('/public/') ? `/api${profileImage}` : profileImage;
}
