import { getImageUrl, userData } from "../store";
import { navigate } from "../../router";
import { sendFriendRequest, unfriend, blockFriend } from "../profile";
import { confirmPopUp } from "../settings";
import { toastError } from "./toast";

interface UserData {
    id: string;
    username: string;
	status: string | null;
	avatar_url: string;
}

async function ViewProfile(userId: string) {
	document.querySelector('#search-results')?.remove();
	navigate('/profile/' + userId);
}

function listUsers(users: UserData[], div: HTMLElement) {
	users.forEach(user => {
		const divp = document.createElement('div');
		divp.className = `flex justify-between px-4 py-1 text-gray-200 hover:bg-[#ffffff10]
						cursor-pointer transition-colors items-center duration-200`;
		divp.innerHTML = /* html */`
			<div class="flex gap-3 items-center">
				<img src="${getImageUrl(user.avatar_url)}" alt="${user.username}" class="w-10 h-10 rounded-full">
				<p class="font-bold">${user.username}</p>
			</div>`;
		const buttonsDiv = document.createElement('div');
		buttonsDiv.className = "flex gap-3 items-center";
		const status = user.status?.toLowerCase();
		
		if (user.id != userData.id) {
			if (status !== 'accepted' && status !== 'blocked') {
				const addFriend = document.createElement('img');
				addFriend.className = `w-6 h-6 cursor-pointer hover:scale-110 transition-transform`;
				addFriend.title = status === 'pending' ? 'Request Pending' : 'Add Friend';
				
				if (status === 'pending') {
					addFriend.src = '/images/pending.svg';
				} else {
					addFriend.src = '/images/addFriend.svg';
					addFriend.addEventListener('click', async (e) => {
						e.stopPropagation();
						try {
							await sendFriendRequest(user.id);
							addFriend.src = '/images/pending.svg';
							addFriend.title = 'Request Pending';
						} catch (error) {
							toastError('Error sending friend request: ' + error);
						}
					});
				}
				buttonsDiv.appendChild(addFriend);
			}
			if (status === 'accepted') {
				const unfriendIcon = document.createElement('img');
				unfriendIcon.src = '/images/unfriend.svg';
				unfriendIcon.className = `w-6 h-6 cursor-pointer hover:scale-110 transition-transform`;
				unfriendIcon.title = 'Unfriend';
				unfriendIcon.onerror = () => { unfriendIcon.style.display = 'none'; };
				unfriendIcon.addEventListener('click', async (e) => {
					e.stopPropagation();
					if (await confirmPopUp('Are you sure you want to unfriend this user?')) {
						try {
							await unfriend(user.id);
							divp.remove();
						} catch (error) {
							toastError('Error unfriending: ' + error);
						}
					}
				});
				buttonsDiv.appendChild(unfriendIcon);
				const blockIcon = document.createElement('img');
				blockIcon.src = '/images/block.svg';
				blockIcon.className = `w-5 h-5 cursor-pointer hover:scale-110 transition-transform opacity-60 hover:opacity-100`;
				blockIcon.title = 'Block User';
				blockIcon.onerror = () => { blockIcon.style.display = 'none'; };
				blockIcon.addEventListener('click', async (e) => {
					e.stopPropagation();
					if (await confirmPopUp('Are you sure you want to block this user?')) {
						try {
							await blockFriend(user.id);
							divp.remove();
						} catch (error) {
							toastError('Error blocking user: ' + error);
						}
					}
				});
				buttonsDiv.appendChild(blockIcon);
			}
		}
		
		const view = document.createElement('button');
		view.textContent = 'view';
		view.className = "font-bold text-color2 hover:scale-110 hover:text-white transition-transform";
		buttonsDiv.appendChild(view);
		view.addEventListener('click', (e) => {
			e.stopPropagation();
			ViewProfile(user.id);
		});
		
		divp.append(buttonsDiv);
		div.appendChild(divp);
	});
}

export async function searchbar() {
	const searchBar = document.getElementById('search-bar');
	if (!searchBar) return;
	const input = searchBar.querySelector('input');
	if (!input) return;
	
	const performSearch = async () => {
		const value = input.value.trim();
		document.getElementById('search-results')?.remove();
		if (value.length <= 0) return;
		
		const div = document.createElement('div');
		div.id = 'search-results';
		div.className = `absolute z-10 top-[44px] left-0 w-full max-h-[300px]
		overflow-y-auto bg-color4 border py-3 border-[#87878766] rounded-xl scrollbar-custom`;
		const response = await fetch(`api/user/search/${userData.id}?username=${value}`, { // i must catch error for this fetch
			headers: {"Authorization": `Bearer ${localStorage.getItem('token')}`},
		});
		const users: UserData[] = await response.json();
		if (users.length === 0) {
			const p = document.createElement('p');
			p.className = "text-gray-400 p-4";
			p.textContent = "No users found";
			div.appendChild(p);
			searchBar.appendChild(div);
			return;
		}
		listUsers(users, div);
		searchBar.appendChild(div);
	};
	
	input.addEventListener('focus', performSearch);
	
	input.addEventListener('keyup', async (e) => {
		if (e.key.length > 1 && e.key !== 'Backspace' && e.key !== 'Delete') return;
		await performSearch();
	});
	
	document.addEventListener('click', (e) => {
		const el = e.target as HTMLElement;
		if (!searchBar.contains(el))
			searchBar.querySelector('#search-results')?.remove();
	});
}
