import { navigate } from '../../router';
import * as data from '../dashboard';
import { shortString } from '../utils';
import { getImageUrl } from '../store';
import { getFriends } from '../components/rightPanel';

export function chatEventHandler() {
	const messageIcon = document.getElementById('message-icon');
	if (!messageIcon) return;
	messageIcon.addEventListener('click', async () => {
		navigate('/chat');
	});
}

function renderMessages() : string {
	return `
		<div class="relative w-[70%] bg-color4 rounded-2xl min-h-[calc(100vh-200px)]
		p-6 flex flex-col justify-between">
			<div>
				<h2 class="text-txtColor text-2xl font-bold mb-6">Messages</h2>
				<div class="h-[1px] bg-gray-700 mb-4"></div>
			</div>
			<div class="h-full bg-bgColor rounded-2xl flex p-3">
				<div class="flex gap-3 font-bold h-fit items-center">
					<img class="h-14 w-14 border border-color1 rounded-full" src="images/mmondad.jpeg">
					<div class="flex flex-col">
						<span class="text-txtColor text-lg">mmondad</span>
						<span class="text-green-500 text-sm">online</span>
					</div>
				</div>
			</div>

			<div class="flex justify-center gap-2 mt-4 w-full items-center">
				<input type="text" placeholder="Type a message..."
				class=" bg-bgColor text-txtColor px-4 py-2 rounded-full w-[60%]
				outline-none border border-color3 focus:border-color1 transition-colors">
				<img class="h-10 w-10" src="images/sentIcon.svg" alt="sent">
			</div>
		</div>
		`;
}
				// <p class="text-txtColor text-center">No messages to display.</p>

async function listFriends() : Promise<string> {
	const friends = await getFriends();
	if (friends.length === 0) {
		return `
		<p class="pt-24 text-txtColor text-center">No friends to display.</p>
		`;
	}
	return `
		<div class="flex flex-col gap-2">
			<p class="text-txtColor text-lg font-bold mb-2">Friends</p>
			<div id="friends-list" class="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-200px)]">
				${friends.map(friend => `
					<div class="flex bg-[#273445] p-3 rounded-2xl">
						<div class="flex w-full gap-4">
							<img class="w-[45px] h-[45px] rounded-full" src="${getImageUrl(friend.profileImage)}" alt="">
							<div class="w-full">
								<div class="flex justify-between w-full">
									<span class="text-txtColor font-bold text-lg">${shortString(friend.username, 15)}</span>
									<p class="text-gray-400 text-sm">Yesterday</p>
								</div>
								<p class="text-gray-400 text-sm">wa fiiiin</p>
							</div>
						</div>
					</div>
				`).join('')}
			</div>
		</div>
	`;
}

export async function renderChat() {
	await data.initDashboard(false);
	const dashContent = document.getElementById('dashboard-content');
	if (dashContent)
		dashContent.innerHTML = `
		<div class="w-full h-full flex">
			<div class="w-[30%] bg-color4 rounded-2xl p-6 mr-4">
				<div id="search-chat" class="relative mx-2 bg-color4
					border border-color1 rounded-full mb-3
					flex items-center">
					<input
						id="search-input-chat"
						type="text"
						autocomplete="off" 
						autocorrect="off"
						autocapitalize="off" 
						spellcheck="false"
						placeholder="Search, users..."
						class="w-full bg-transparent text-gray-200 py-2
						px-4 outline-none placeholder:text-gray-500 sm:placeholder:text-sm placeholder:text-xs"
					/>
					<svg xmlns="http://www.w3.org/2000/svg" class="absolute right-4 w-6 h-6
					text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
					d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z" />
					</svg>
				</div>
				<div class="h-[1px] bg-gray-700 mb-4"></div>
				${await listFriends()}
			</div>
			${renderMessages()}
		</div>
	`;
}
// <p class="pt-24 text-txtColor text-center">No friends to display.</p>