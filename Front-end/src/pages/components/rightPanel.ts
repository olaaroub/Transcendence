import { credentials, IUserData } from "../store";

export async function getFriends(): Promise<IUserData[]> {
	try {
		const response = await fetch(`/api/user/${credentials.id}/friends`, {
			headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` },
		});
		if (!response.ok) {
			console.error('Failed to fetch friends:', response.statusText);
			return [];
		}
		const friends: IUserData[] = await response.json();
		return friends;
	} catch (err) {
		console.error('Error fetching friends:', err);
		return [];
	}
}
