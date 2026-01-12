export interface IUserData {
	id: number | string | null;
	email: string | null;
	username: string | null;
	bio: string | null;
	status: string | null;
	onlineStatus?: string | null;
	auth_provider: string | null;
	avatar_url: string | null;
	is_read: string | null;
	Rating: number;
	TotalWins: number;
	TotalLosses: number;
	GamesPlayed: number;
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

export const userData : IUserData = {
	id: null,
	email: null,
	username: null,
	bio: null,
	status: null,
	auth_provider: null,
	avatar_url: null,
	is_read: null,
	Rating: 0,
	TotalWins: 0,
	TotalLosses: 0,
	GamesPlayed: 0
};

export function setUserData(newData: IUserData)
{
	Object.assign(userData, newData);
}

export function getImageUrl(avatar_url: string | null | undefined): string | null {
	if (!avatar_url) return null;
	return avatar_url.startsWith('/public/') ? `/api${avatar_url}` : avatar_url;
}
