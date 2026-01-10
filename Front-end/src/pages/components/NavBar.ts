import { credentials, getImageUrl, IUserData } from "../store";
import { shortString } from "../utils";
import { apiFetch } from "./errorsHandler";

const $ = (id: string) => document.getElementById(id as string)
let pendingUsers: IUserData[] | null = null;
let socket: WebSocket | null = null;

type FriendStatusCallback = (friendId: string, status: 'ONLINE' | 'OFFLINE') => void;
const friendStatusSubscribers: Set<FriendStatusCallback> = new Set();

export function subscribeFriendStatus(callback: FriendStatusCallback): () => void {
	friendStatusSubscribers.add(callback);
	return () => friendStatusSubscribers.delete(callback);
}

function notifyFriendStatusChange(friendId: string, status: 'ONLINE' | 'OFFLINE'): void {
	friendStatusSubscribers.forEach(callback => callback(friendId, status));
}

function initNotificationSocket(): void {
	if (!credentials.id || socket) return;

	const wsUrl = `wss://${window.location.host}/api/user/notification/${credentials.id}`;
	socket = new WebSocket(wsUrl);
	socket.onopen = () => {
		console.log('WebSocket connection established for notifications');
	};
	socket.onmessage = (event) => {
		try {
			const parsed = JSON.parse(event.data);
			if (parsed.type ==  'NOTIFICATION_READED')
				$("notification-icon")?.querySelector('span')?.classList.add('hidden')
			else if (parsed.type == 'SEND_NOTIFICATION')
			{
				const newUsers: IUserData[] = Array.isArray(parsed) ? parsed : [parsed];
				pendingUsers = (pendingUsers ?? []).concat(newUsers);
				$("notification-icon")?.querySelector('span')?.classList.remove('hidden');
			}
			else if (parsed.type === 'FRIEND_ONLINE') {
				notifyFriendStatusChange(String(parsed.friend_id), 'ONLINE');
			}
			else if (parsed.type === 'FRIEND_OFFLINE') {
				notifyFriendStatusChange(String(parsed.friend_id), 'OFFLINE');
			}
		} catch (err) {console.error(err)}
	};
	socket.onerror = (error) => {
		console.error('WebSocket error:', error);
	};
	socket.onclose = (event) => {
		console.log('WebSocket connection closed:', event.code, event.reason);
		socket = null;
	};
}

export function closeNotificationSocket(): void {
	if (socket) {
		socket.close();
		socket = null;
	}
}

export function renderNavBar (isLoged: boolean)
{
    return /* html */ `
		<nav class="flex justify-between items-center pt-6 sm:pt-10">
			<img id="navBar-logo" class="w-[115px] h-auto cursor-pointer" src="/images/logo.png" alt="pong" />
			<div  class=" ${isLoged ? "hidden" : ""} gap-3 sm:gap-5 flex">
				<button id="go-sign-up" class="py-2 px-4 sm:px-6 border text-color2 border-color2 rounded-lg transition-all opacity-70 duration-500 hover:bg-color2 hover:text-black font-bold text-sm sm:text-base">Sign Up</button>
				<button id="go-sign-in" class="bg-[#F0F0F0] py-2 px-4 sm:px-6 text-black border border-color2 transition-all duration-500 hover:bg-color2 rounded-lg hover:text-black font-bold text-sm sm:text-base opacity-70">Login</button>
			</div>
		</nav>
    `
}

function searchBar() : string
{
	return /* html */`
		<div id="search-bar" class="relative w-[150px] mx-2 sm:w-[250px]
		md:w-[300px] lg:w-[400px] 2xl:w-[550px] bg-color4
		border border-color4 rounded-full
		flex items-center">
			<input

				id="search-input"
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
	`
}

async function getPendingUsers() : Promise<{users: IUserData[], is_read: boolean} | null>
{
	const { data, error } = await apiFetch<{userFriends: IUserData[], is_read: boolean}>(`api/user/${credentials.id}/getPendingRequestes`, {
		showErrorToast: false

	});
	if (error || !data) {
		console.error('Failed to fetch pending users:', error?.message);
		return null;
	}
	const users: IUserData[] = data.userFriends;
	const is_read = data.is_read !== undefined ? data.is_read : true;
	return { users, is_read };
}

async function handleFriendRequest(requesterId: string, accept: boolean, userElement: HTMLElement, user: IUserData) {
	const { error } = await apiFetch(`/api/user/${credentials.id}/friend-request`, {
		method: 'POST',
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ id: requesterId, accept: accept }),
		showErrorToast: true
	});

	if (!error) {
		userElement.remove();
		const index = pendingUsers?.indexOf(user);
		if (index !== undefined && index !== -1)
			pendingUsers?.splice(index, 1);
	}
}

export async function notifications()
{
	initNotificationSocket();

	const notificationIcon = $('notification-icon');
	const pendingData = await getPendingUsers();

	if (!pendingData) {
		pendingUsers = null;
		return;
	}
	pendingUsers = pendingData.users;
	const isRead = pendingData.is_read;

	if (pendingUsers && pendingUsers.length !== 0 && !isRead)
		$("notification-icon")?.querySelector('span')?.classList.remove('hidden');
	if (!notificationIcon) return;
	notificationIcon.addEventListener('click',async  () => {
		const existingResult = $('notifications-result');
		if (!existingResult && socket)
			socket.send(JSON.stringify({type: 'MAKE_AS_READ'}))
		if (existingResult) {
			existingResult.remove();
			return;
		}
		const result = document.createElement('div');
		result.className = `absolute top-12 right-0 w-72 bg-black/90 backdrop-blur-md flex flex-col
		border border-borderColor rounded-2xl shadow-lg py-2 z-50 max-h-[350px] overflow-y-auto
		scrollbar-custom`;
		result.id = "notifications-result";
		result.innerHTML = /* html */ `
			<p class="text-txtColor text-sm font-medium px-4 py-2 border-b border-borderColor/50">Notifications</p>
		`;
		notificationIcon.append(result);
		if (!pendingUsers || pendingUsers.length === 0)
		{
			const noNotifications = document.createElement('div');
			noNotifications.className = "flex items-center justify-center py-8 px-4";
			noNotifications.innerHTML = `
				<p class="text-gray-500 text-sm">No new notifications</p>
			`;
			result.append(noNotifications);
			return;
		}
		for(const user of pendingUsers)
		{
			const pandingUser = document.createElement('div');
			pandingUser.className = `flex justify-between items-center mx-2 px-3 py-3 rounded-xl
				hover:bg-color1/20 transition-colors duration-200 cursor-pointer`;
			pandingUser.innerHTML = /* html */ `
				<div class="flex gap-3 items-center">
					<img class="w-10 h-10 rounded-full object-cover border border-borderColor/30" src="${getImageUrl(user.avatar_url)}" alt="">
					<div class="flex flex-col">
						<span class="text-txtColor text-sm font-medium">${shortString(user.username, 12)}</span>
						<span class="text-gray-500 text-xs">Wants to be friends</span>
					</div>
				</div>
				<div class="flex gap-1 items-center">
					<button class="refuse-btn p-1.5 rounded-lg hover:bg-red-500/20 transition-colors duration-200" data-user-id="${user.id}">
						<svg class="w-5 h-5" fill="#ef4444" viewBox="0 0 24 24">
							<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
						</svg>
					</button>
					<button class="accept-btn p-1.5 rounded-lg hover:bg-green-500/20 transition-colors duration-200" data-user-id="${user.id}">
						<svg class="w-5 h-5" fill="#22c55e" viewBox="0 0 24 24">
							<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
						</svg>
					</button>
				</div>
			`;
			const acceptBtn = pandingUser.querySelector('.accept-btn');
			const refuseBtn = pandingUser.querySelector('.refuse-btn');

			if (user.id) {
				acceptBtn?.addEventListener('click', async () => {
					await handleFriendRequest(String(user.id), true, pandingUser, user);
				});
				refuseBtn?.addEventListener('click', () => {
					handleFriendRequest(String(user.id), false, pandingUser, user);
				});
			}
			result.append(pandingUser);
		}
	});
	document.addEventListener('click', (e) => {
		const el = e.target as HTMLElement;
		if (!notificationIcon.contains(el))
			notificationIcon.querySelector('#notifications-result')?.remove();
	});
}

export function renderDashboardNavBar(user: IUserData | null, imageUrl: string | null): string {
	return /* html */ `
	<nav class="relative z-50 flex justify-between items-center py-14 w-full m-auto md:px-10 h-[70px] mb-7">
		<img id="main-logo" src="/images/logo.png"
		class="w-[100px] xl:w-[115px] my-10 xl:my-14 block cursor-pointer" />
		${searchBar()}
		<div class="flex items-center gap-3 mr-6">
			<div id="message-icon"
			class="bg-color4 translate-y-[2px] rounded-full p-2 cursor-pointer">
				<img src="images/messageIcon.svg" class="w-[25px] h-[25px] invert
				sepia saturate-200 hue-rotate-[330deg]">
			</div>
			<div id="notification-icon"
			class="relative bg-color4 cursor-pointer translate-y-[2px] rounded-full p-2">
				<span class="hidden absolute top-0 right-0 w-3 h-3 bg-red-500
				border-2 border-[#0f2a3a] rounded-full"></span>
				<img src="images/notificationIcon.svg" class="w-[25px] h-[25px] invert
				sepia saturate-200 hue-rotate-[330deg]">
			</div>
			<div class="flex items-center gap-3 ">
				<div id="avatar" class=" relative cursor-pointer
				transition-transform duration-300">
					<img src="${imageUrl}" class=" w-[50px] h-[50px] rounded-full
					border-2 border-transparent" alt="userAvatar"/>
					<span class="absolute bottom-0 right-0 w-3 h-3 bg-green-500
					border-2 border-[#0f2a3a] rounded-full"></span>
				</div>
				<p class="text-sm text-gray-200 font-bold">${shortString(user?.username, 10)}</p>
			</div>
		</div>
	</nav>
	`;
}
