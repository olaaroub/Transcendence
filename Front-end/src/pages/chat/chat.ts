import { navigate } from '../../router';
import * as data from '../dashboard';
import { shortString, formatMessageTime } from '../utils';
import { credentials, getImageUrl, IUserData } from '../store';
import { apiFetch } from '../components/errorsHandler';
import { toastInfo } from '../components/toast';
import { io, Socket } from "socket.io-client";


let socket: Socket | null = null;
let notificationSocketInitialized = false;

interface ChatMessage {
	id?: number;
	messageId?: number;
	senderId: number;
	content: string;
	conversationId: number;
	createdAt: string;
}

interface ChatState {
	currentConversationId: number | null;
	currentFriend: IUserData | null;
	messages: ChatMessage[];
	friends: IUserData[];
}

const chatState: ChatState = {
	currentConversationId: null,
	currentFriend: null,
	messages: [],
	friends: []
};

export function initGlobalChatNotifications() {
	if (notificationSocketInitialized || socket) return;
	
	socket = io({
		path: '/api/chat/private/socket.io',
		transports: ['websocket', 'polling'],
	});
	
	socket.on("connect", () => {
		console.log("Connected to private chat");
		socket?.emit("userId", credentials.id);
	});

	socket.on("connect_error", (error) => {
		console.error("Socket connection error:", error.message);
	});

	socket.on("disconnect", (reason) => {
		console.log("Disconnected from private chat:", reason);
	});

	socket.on("new_notification", (data: { type: string; from: number; conversationId: number; text: string }) => {
		console.log("New notification:", data);
		if (data.type === "NEW_MESSAGE" && !window.location.pathname.includes('/chat')) {
			toastInfo(`New message received!`, { duration: 4000 });
		}
	});

	socket.on("error", (data) => {
		console.error("Chat error:", data.message);
	});

	if (socket.connected) {
		socket.emit("userId", credentials.id);
	}
	
	notificationSocketInitialized = true;
	console.log("Global chat notifications initialized");
}

function setupChatListeners() {
	if (!socket) return;

	socket.off("chat_initialized");
	socket.off("receive_message");
	socket.off("message_sent");

	socket.on("chat_initialized", (data: { conversationId: number; messages: ChatMessage[] }) => {
		console.log("Chat initialized:", data);
		chatState.currentConversationId = data.conversationId;
		chatState.messages = data.messages || [];
		updateMessagesUI();
	});
	socket.on("receive_message", (data: ChatMessage) => {
		console.log("New message received:", data);
		if (data.conversationId === chatState.currentConversationId) {
			if (data.senderId === Number(credentials.id)) return;
			chatState.messages.push(data);
			updateMessagesUI();
		}
	});

	socket.on("message_sent", (data) => {
		console.log("Message sent confirmation:", data);
	});
}

function openChat(friend: IUserData) {
	if (!socket) return;
	
	chatState.currentFriend = friend;
	chatState.messages = [];

	socket.emit("open_chat", {
		senderId: credentials.id,
		receiverId: friend.id
	});
	updateChatHeaderUI();
}

function sendMessage(content: string) {
	if (!socket || !content.trim() || !chatState.currentConversationId || !chatState.currentFriend)
		return;

	socket.emit("send_message", {
		conversationId: chatState.currentConversationId,
		senderId: Number(credentials.id),
		receiverId: Number(chatState.currentFriend.id),
		content: content.trim()
	});
	const optimisticMessage: ChatMessage = {
		senderId: Number(credentials.id),
		content: content.trim(),
		conversationId: chatState.currentConversationId,
		createdAt: new Date().toISOString()
	};
	chatState.messages.push(optimisticMessage);
	updateMessagesUI();
}

function updateMessagesUI() {
	const messagesContainer = document.getElementById('private-chat-messages');
	const input = document.getElementById('private-chat-input') as HTMLInputElement;
	const sendBtn = document.getElementById('private-chat-send') as HTMLButtonElement;

	if (input && sendBtn) {
		if (chatState.currentConversationId) {
			input.disabled = false;
			sendBtn.disabled = false;
		} else {
			input.disabled = true;
			sendBtn.disabled = true;
		}
	}
	if (!messagesContainer) return;
	if (chatState.messages.length === 0) {
		messagesContainer.innerHTML = /* html */`
			<div class="flex items-center justify-center h-full text-gray-400">
				<p>No messages yet. Start the conversation!</p>
			</div>
		`;
	} else {
		messagesContainer.innerHTML = chatState.messages.map(msg => {
			const isMine = msg.senderId === Number(credentials.id);
			return /* html */`
				<div class="flex ${isMine ? 'justify-end' : 'justify-start'} mb-3">
					<div class="max-w-[70%] ${isMine ? 'bg-color1 text-bgColor' : 'bg-[#1a1a2e] text-txtColor'} 
						px-4 py-2 rounded-2xl ${isMine ? 'rounded-br-sm' : 'rounded-bl-sm'}">
						<p class="text-sm break-words">${msg.content}</p>
						<span class="text-xs ${isMine ? 'text-bgColor/70' : 'text-gray-400'} mt-1 block text-right">
							${formatMessageTime(msg.createdAt)}
						</span>
					</div>
				</div>
			`;
		}).join('');
	}
	messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function updateChatHeaderUI() {
	const chatHeader = document.getElementById('private-chat-header');
	if (!chatHeader || !chatState.currentFriend) return;
	console.log("chat state : ", chatState);
	chatHeader.innerHTML = /* html */`
		<div class="flex gap-3 font-bold items-center">
			<img class="h-12 w-12 border border-color1 rounded-full object-cover" 
				src="${getImageUrl(chatState.currentFriend.avatar_url) || '/images/default-avatar.png'}">
			<div class="flex flex-col">
				<span class="text-txtColor text-lg">${chatState.currentFriend.username}</span>
				<span class="${chatState.currentFriend.status === 'ONLINE' ? 'text-green-500' : 'text-gray-400'} text-sm">
					${chatState.currentFriend.status || 'offline'}
				</span>
			</div>
		</div>
	`;
}

function setupChatEventListeners() {
	const sendBtn = document.getElementById('private-chat-send');
	const input = document.getElementById('private-chat-input') as HTMLInputElement;

	if (sendBtn) {
		sendBtn.addEventListener('click', () => {
			if (input && input.value.trim()) {
				sendMessage(input.value);
				input.value = '';
			}
		});
	}
	if (input) {
		input.addEventListener('keypress', (e) => {
			if (e.key === 'Enter' && input.value.trim()) {
				sendMessage(input.value);
				input.value = '';
			}
		});
	}
}

function setupFriendsClickListeners() {
	const friendsList = document.getElementById('friends-list');
	if (!friendsList) return;

	friendsList.querySelectorAll('[data-friend-id]').forEach(el => {
		el.addEventListener('click', () => {
			const friendId = el.getAttribute('data-friend-id');
			const friend = chatState.friends.find(f => String(f.id) === friendId);
			if (friend) {
				friendsList.querySelectorAll('[data-friend-id]').forEach(item => {
					item.classList.remove('border-color1', 'border-l-2');
				});
				el.classList.add('border-color1', 'border-l-2');
				openChat(friend);
			}
		});
	});
}

export function cleanupPrivateChat() {
	if (socket) {
		socket.removeAllListeners();
		socket.disconnect();
		socket = null;
	}
	chatState.currentConversationId = null;
	chatState.currentFriend = null;
	chatState.messages = [];
	chatState.friends = [];
	notificationSocketInitialized = false;
}

export function chatEventHandler() {
	const messageIcon = document.getElementById('message-icon');
	if (!messageIcon) return;
	messageIcon.addEventListener('click', async () => {navigate('/chat');});
}

function renderMessages() : string {
	return /* html */`
		<div class="relative w-[70%] bg-color4 rounded-2xl min-h-[calc(100vh-200px)]
		p-6 flex flex-col">
			<div>
				<h2 class="text-txtColor text-2xl font-bold mb-6">Messages</h2>
				<div class="h-[1px] bg-gray-700 mb-4"></div>
			</div>
			<div id="private-chat-header" class="bg-black rounded-t-2xl p-3 border-b border-gray-700">
				<div class="flex gap-3 font-bold items-center text-gray-400">
					<p>Select a friend to start chatting</p>
				</div>
			</div>
			<div id="private-chat-messages" class="flex-1 bg-black p-4 overflow-y-auto min-h-[300px] max-h-[calc(100vh-450px)]
				scrollbar-thin scrollbar-thumb-color1 scrollbar-track-transparent hover:scrollbar-thumb-color2 pr-2">
				<div class="flex items-center justify-center h-full text-gray-400">
					<p>Select a conversation from the left</p>
				</div>
			</div>
			<div class="flex justify-center gap-2 mt-0 w-full items-center bg-black rounded-b-2xl p-3">
				<input type="text" id="private-chat-input" placeholder="Type a message..."
				class="bg-gray-800 text-txtColor px-4 py-2 rounded-full w-[80%]
				outline-none border border-color3 focus:border-color1 transition-colors
				disabled:opacity-50 disabled:cursor-not-allowed"
				${!chatState.currentConversationId ? 'disabled' : ''}>
				<button id="private-chat-send"
					class="bg-color1 hover:bg-color2 h-10 w-10 rounded-full flex items-center justify-center
					transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
					${!chatState.currentConversationId ? 'disabled' : ''}>
					<svg class="w-5 h-5 text-bgColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
					</svg>
				</button>
			</div>
		</div>
		`;
}

async function listFriends() : Promise<string> {
	const { data: friends } = await apiFetch<IUserData[]>(`/api/user/${credentials.id}/friends`);
	if (!friends || friends.length === 0) {
		chatState.friends = [];
		return /* html */`<p class="pt-24 text-txtColor text-center">No friends to display.</p>`;
	}
	chatState.friends = friends;
	return /* html */`
		<div class="flex flex-col gap-2">
			<div id="friends-list" class="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-200px)]
				scrollbar-thin scrollbar-thumb-color1 scrollbar-track-transparent hover:scrollbar-thumb-color2 pr-2">
				${friends.map((friend: IUserData) => /* html */`
					<div data-friend-id="${friend.id}" 
						class="flex bg-[#0f0f1a] hover:bg-[#1a1a2e] p-3 rounded-2xl cursor-pointer
						transition-all duration-200 hover:border-l-2 hover:border-color1">
						<div class="flex w-full gap-4">
							<img class="w-[45px] h-[45px] rounded-full object-cover" 
								src="${getImageUrl(friend.avatar_url) || '/images/default-avatar.png'}" alt="">
							<div class="w-full">
								<div class="flex justify-between w-full">
									<span class="text-txtColor font-bold text-lg">${shortString(friend.username, 15)}</span>
									<span class="w-2 h-2 mt-2 rounded-full ${friend.status === 'ONLINE' ? 'bg-green-500' : 'bg-gray-400'}"></span>
								</div>
								<p class="text-gray-400 text-sm">${friend.status?.toLocaleLowerCase() || 'offline'}</p>
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
	
	chatState.currentConversationId = null;
	chatState.currentFriend = null;
	chatState.messages = [];
	setupChatListeners();
	const dashContent = document.getElementById('dashboard-content');
	if (dashContent)
		dashContent.innerHTML = /* html */`
		<div class="w-full h-full flex">
			<div class="w-[30%] bg-color4 rounded-2xl p-6 mr-4">
				<p class="text-txtColor font-bold mb-2 text-lg">Friends</p>
				<div class="h-[1px] bg-gray-700 mb-4"></div>
				${await listFriends()}
			</div>
			${renderMessages()}
		</div>
	`;
	setTimeout(() => {
		setupChatEventListeners();
		setupFriendsClickListeners();
	}, 0);
}
