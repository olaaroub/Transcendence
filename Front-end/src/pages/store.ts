export interface IUserData {
	id: number | string | null;
	email: string | null;
	username: string | null;
	bio: string | null;
	status: string | null;
	auth_provider: string | null;
	avatar_url: string | null;
	is_read: string | null;
}

export const credentials = {
	id: localStorage.getItem('id'),
	token: localStorage.getItem('token'),
};

export function setCredentials()
{	
	credentials.id = localStorage.getItem('id');
	credentials.token = localStorage.getItem('token');
}

if (!credentials.id || !credentials.token) {
	console.warn('Missing credentials in store');
}

export const userData : IUserData = {
	id: null,
	email: null,
	username: null,
	bio: null,
	status: null,
	auth_provider: null,
	avatar_url: null,
	is_read: null
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
export function getImageUrl(avatar_url: string | null | undefined): string | null {
	// console.log("profile img", avatar_url)
	if (!avatar_url) return null;
	return avatar_url.startsWith('/public/') ? `/api${avatar_url}` : avatar_url;
}
