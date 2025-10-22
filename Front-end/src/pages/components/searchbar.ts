interface UserData {
    id: string;
    username: string;
}

async function ViewProfile(username: string) {
	
}


export async function searchbar() {
	const searchBar = document.getElementById('search-bar');
	if (searchBar) {
		const input = searchBar.querySelector('input');
		if (input) {
			input.addEventListener('keyup',async (e) => {
				const value = (e.target as HTMLInputElement).value;
				let div = document.getElementById('search-results');
				if (div) div.remove();
				if (value.length <= 0)
					return ;
				div = document.createElement('div');
				div.id = 'search-results';
				div.className = `absolute z-10 top-[44px] left-0 w-full max-h-[300px]
				overflow-y-auto bg-color4 border border-[#87878766] rounded-xl `;
				// const filteredUsers = mockUsers.filter(user => user.toLowerCase().includes(value.toLowerCase()));
				const response = await fetch(`http://127.0.0.1:3000/users/search?username=${value}`, {
					headers: {"Authorization": `Bearer ${localStorage.getItem('token')}`},
				});
				const users: UserData[] = await response.json();
				if (users.length === 0) {
					const p = document.createElement('p');
					p.className = "text-gray-400 p-4";
					p.textContent = "No users found";
					div.appendChild(p);
				} else {
					users.forEach(user => {
						if (localStorage.getItem('id') == user.id)
							return ;
						const divp = document.createElement('div');
						divp.className = `flex justify-between p-4 text-gray-200 p-4 hover:bg-[#ffffff10]
										cursor-pointer transition-colors duration-200`;

						const view  = document.createElement('button');
						view.textContent = 'view';
						view.className = "font-bold text-color2 hover:scale-110 hover:text-white";

						const p = document.createElement('p');
						p.textContent = user.username;

						view.addEventListener('click', _=> {
							ViewProfile(user.id);
						});
						divp.append(p, view);
						div?.appendChild(divp);
					});
				}
				searchBar.appendChild(div);
			});
		}
	}
		document.addEventListener('click', (e) => {
			const el = e.target as HTMLElement;
			if (!searchBar!.contains(el)) {
				let searchResult = searchBar!.querySelector('#search-results');
				if (searchResult) searchResult.remove();
			}
		});
}