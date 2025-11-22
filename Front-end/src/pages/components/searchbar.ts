import { getImageUrl, userData } from "../store";
import { navigate } from "../../router";
import { sendFriendRequest } from "../profile";

interface UserData {
    id: string;
    username: string;
	profileImage: string;
	status: string | null;
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
		divp.innerHTML = `<div class="flex gap-3 items-center">
			<img src="${getImageUrl(user.profileImage)}" alt="${user.username}" class="w-10 h-10 rounded-full">
			<div>
				<p class="font-bold">${user.username}</p>
			</div>
		</div>`;
		const buttonsDiv = document.createElement('div');
		buttonsDiv.className = "flex gap-4 items-center";
		const addFriend = document.createElement('img');
		addFriend.src = `/images/addFriends.svg`;
		addFriend.className = `w-6 h-6 cursor-pointer hover:scale-110`;
		addFriend.title = "Add Friend";
		if (!user.status && user.id != userData.id)
			buttonsDiv.appendChild(addFriend);
		addFriend.addEventListener('click', async _=> {
			if (user.status == 'pending' || user.status)
				return;
		try {
			await sendFriendRequest(user!.id);
			addFriend.src = `/images/pending.gif`
		} catch (error) {
			alert('Error sending friend request: ' + error);
		}
		});
		const view  = document.createElement('button');
		view.textContent = 'view';
		view.className = "font-bold text-color2 hover:scale-110 hover:text-white";
		buttonsDiv.appendChild(view);
		view.addEventListener('click', _=> {
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
		const response = await fetch(`api/users/search/${userData.id}?username=${value}`, {
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
