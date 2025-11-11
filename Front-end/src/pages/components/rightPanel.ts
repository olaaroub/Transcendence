import { credentials, getImageUrl, IUserData } from "../store";

export async function getFriends(): Promise<IUserData[]> {
	try {
		const response = await fetch(`/api/users/${credentials.id}/friends`, {
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

export async function renderRightPanel(): Promise<string> {
	const friends = await getFriends();
	return `
		<div id="friends-list" class="flex flex-col gap-3 py-3 px-3 group bg-color4 rounded-[25px] transition-all
		duration-200 h-[400px] overflow-y-auto scrollbar-custom">
			${friends
			.map(
			(friend) => `
				<div class="friend-item flex items-center group-hover:space-x-3 cursor-pointer hover:scale-105 transition-all duration-150" data-id="${friend.id}">
					<img class="w-[45px] h-[45px] rounded-full flex-shrink-0 border-[2px] border-color1" src="${getImageUrl(friend.profileImage)}" />
					<p class="opacity-0 max-w-0 text-txtColor transition-all duration-500 group-hover:opacity-100
					group-hover:max-w-[150px] font-semibold text-xs sm:text-sm 3xl:text-lg truncate">
						${friend.username}
					</p>
				</div>
			`
			)
			.join("")}
		</div>
	`;
}
