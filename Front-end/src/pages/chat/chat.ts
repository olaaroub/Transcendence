import { navigate } from '../../router';
import * as data from '../dashboard';
import { shortString } from '../utils';
import { credentials, getImageUrl, IUserData } from '../store';
import { apiFetch } from '../components/errorsHandler';

import { io, Socket } from "socket.io-client";


let socket: Socket | null = null;

function getSocket(): Socket {
	if (!socket) {
		socket = io(`wss://${window.location.host}`, {
			path: '/api/chat/private/socket.io',
			transports: ['websocket', 'polling'],
		});
	}
	return socket;
}

function initializeSocket() {
	const sock = getSocket();
	
	sock.on("connect", () => {
		console.log("Connected to private chat");
		sock.emit("userId", credentials.id);
	});

	sock.on("connect_error", (error) => {
		console.error("Socket connection error:", error.message);
	});

	sock.on("disconnect", (reason) => {
		console.log("Disconnected from private chat:", reason);
	});

	sock.on("chat_initialized", (data) => {
		console.log("Chat initialized:", data);
	});

	sock.on("receive_message", (data) => {
		console.log("New message received:", data);
	});

	sock.on("new_notification", (data) => {
		console.log("New notification:", data);
	});

	return sock;
}

export function chatEventHandler() {
	const messageIcon = document.getElementById('message-icon');
	if (!messageIcon) return;
	messageIcon.addEventListener('click', async () => {
		navigate('/chat');
	});
}

function renderMessages() : string {
	return /* html */`
		<div class="relative w-[70%] bg-color4 rounded-2xl min-h-[calc(100vh-200px)]
		p-6 flex flex-col justify-between">
			<div>
				<h2 class="text-txtColor text-2xl font-bold mb-6">Messages</h2>
				<div class="h-[1px] bg-gray-700 mb-4"></div>
			</div>
			<div class="h-full bg-black rounded-2xl flex p-3">
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
				class=" bg-black text-txtColor px-4 py-2 rounded-full w-[60%]
				outline-none border border-color3 focus:border-color1 transition-colors">
				<img class="h-10 w-10 hover:bg-color3 hover:rounded-full transition-all duration-300
				cursor-pointer hover:p-2" src="images/icons8-send.svg" alt="sent">
			</div>
		</div>
		`;
}

async function listFriends() : Promise<string> {
	const { data: friends } = await apiFetch<IUserData[]>(`/api/user/${credentials.id}/friends`);
	if (!friends || friends.length === 0) {
		return /* html */`
		<p class="pt-24 text-txtColor text-center">No friends to display.</p>
		`;
	}
	return /* html */`
		<div class="flex flex-col gap-2">
			<p class="text-txtColor text-lg font-bold mb-2">Friends</p>
			<div id="friends-list" class="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-200px)]">
				${friends.map((friend: IUserData) => /* html */`
					<div class="flex bg-[#273445] p-3 rounded-2xl">
						<div class="flex w-full gap-4">
							<img class="w-[45px] h-[45px] rounded-full" src="${getImageUrl(friend.avatar_url)}" alt="">
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
	
	initializeSocket();
	const dashContent = document.getElementById('dashboard-content');
	if (dashContent)
		dashContent.innerHTML = /* html */`
		<div class="w-full h-full flex">
			<div class="w-[30%] bg-color4 rounded-2xl p-6 mr-4">
				<p class="text-txtColor font-bold mb-2 text-lg">friends</p>
				<div class="h-[1px] bg-gray-700 mb-4"></div>
				${await listFriends()}
			</div>
			${renderMessages()}
		</div>
	`;
}
