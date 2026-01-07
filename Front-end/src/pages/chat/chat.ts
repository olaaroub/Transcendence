import { navigate } from '../../router';
import * as data from '../dashboard';
import { shortString, formatMessageTime } from '../utils';
import { credentials, getImageUrl, IUserData } from '../store';
import { apiFetch } from '../components/errorsHandler';
import { toastInfo } from '../components/toast';
import { io, Socket } from "socket.io-client";
import { subscribeFriendStatus } from '../components/NavBar';


let socket: Socket | null = null;
let friendStatusUnsubscribe: (() => void) | null = null;
let notificationSocketInitialized = false;
const UNREAD_STORAGE_KEY = 'chat_unread_counts';

function saveUnreadToStorage() {
	const data: Record<number, number> = {};
	chatState.unreadCounts.forEach((count, friendId) => {data[friendId] = count;});
	localStorage.setItem(UNREAD_STORAGE_KEY, JSON.stringify(data));
}

function loadUnreadFromStorage() {
	try {
		const stored = localStorage.getItem(UNREAD_STORAGE_KEY);
		if (stored) {
			const data = JSON.parse(stored);
				Object.entries(data).forEach(([friendId, count]) => {
				chatState.unreadCounts.set(Number(friendId), count as number);
			});
		}
	} catch (e) {console.error('Error loading unread counts from storage:', e);}
}

export function getTotalUnreadCount(): number {
	let total = 0;
	chatState.unreadCounts.forEach(count => {total += count;});
	return total;
}

export function updateMessageIconBadge() {
	const messageIcon = document.getElementById('message-icon');
	if (!messageIcon) return;

	let totalUnread = getTotalUnreadCount();
	let redDot = messageIcon.querySelector('.message-unread-dot');
	if (totalUnread > 0) {
		if (!redDot) {
			redDot = document.createElement('span');
			redDot.className = 'message-unread-dot absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-[#0f2a3a] rounded-full';
			messageIcon.classList.add('relative');
			messageIcon.appendChild(redDot);
		}
	} else {if (redDot) redDot.remove();}
}

export function initUnreadFromStorage() {
	loadUnreadFromStorage();
	updateMessageIconBadge();
}

interface ChatMessage {
	id?: number;
	messageId?: number;
	senderId: number;
	content: string;
	conversationId: number;
	createdAt: string;
	seen?: boolean;
}

interface ChatState {
	currentConversationId: number | null;
	currentFriend: IUserData | null;
	messages: ChatMessage[];
	friends: IUserData[];
	isTyping: boolean;
	typingUserId: number | null;
	unreadCounts: Map<number, number>;
}

const chatState: ChatState = { // why
	currentConversationId: null,
	currentFriend: null,
	messages: [],
	friends: [],
	isTyping: false,
	typingUserId: null,
	unreadCounts: new Map()
};

let typingTimeout: ReturnType<typeof setTimeout> | null = null;

export function initGlobalChatNotifications() {
	if (notificationSocketInitialized || socket) return;

	initUnreadFromStorage();
	socket = io({
		path: '/api/chat/private/socket.io',
		transports: ['websocket', 'polling'], // why
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
	socket.on("unread_messages", (data: { conversationId: number; friendId: number; unreadCount: number; hasUnread: boolean }) => {
		console.log("Unread messages update:", data);
		if (data.hasUnread && data.friendId) {
			chatState.unreadCounts.set(data.friendId, data.unreadCount);
		} else if (data.friendId) {
			chatState.unreadCounts.delete(data.friendId);
		}
		saveUnreadToStorage();
		updateMessageIconBadge();
		updateUnreadIndicatorsUI();
	});
	socket.on("all_unread_counts", (data: { unreadCounts: { conversationId: number; friendId: number; unreadCount: number }[] }) => {
		console.log("All unread counts:", data);
		chatState.unreadCounts.clear();
		data.unreadCounts.forEach(item => {
			if (item.friendId) {
				chatState.unreadCounts.set(item.friendId, item.unreadCount);
			}
		});
		saveUnreadToStorage();
		updateMessageIconBadge();
		updateUnreadIndicatorsUI();
	});
	socket.on("error", (data) => {console.error("Chat error:", data.message);});
	if (socket.connected)
		socket.emit("userId", credentials.id);
	notificationSocketInitialized = true;
}

function setupChatListeners() {
	if (!socket) return;

	socket.off("chat_initialized");
	socket.off("receive_message");
	socket.off("message_sent");
	socket.off("messages_seen");
	socket.off("user_typing");

	socket.on("chat_initialized", (data: { conversationId: number; messages: ChatMessage[] }) => {
		console.log("Chat initialized:", data);
		chatState.currentConversationId = data.conversationId;
		chatState.messages = data.messages || [];
		if (chatState.currentFriend) {
			chatState.unreadCounts.delete(Number(chatState.currentFriend.id));
		}
		saveUnreadToStorage();
		updateMessageIconBadge();
		updateUnreadIndicatorsUI();
		updateMessagesUI();
	});

	socket.on("receive_message", (data: ChatMessage) => {
		console.log("New message received:", data);
		if (data.conversationId === chatState.currentConversationId) {
			if (data.senderId === Number(credentials.id ?? 0)) return;
			chatState.messages.push(data);
			updateMessagesUI();
			markMessagesAsSeen();
		}
	});

	socket.on("message_sent", (data) => {console.log("Message sent confirmation:", data);});
	socket.on("messages_seen", (data: { conversationId: number; seenBy: number }) => {
		if (data.conversationId === chatState.currentConversationId) {
			chatState.messages.forEach(msg => {
				if (msg.senderId === Number(credentials.id)) msg.seen = true;});
			updateMessagesUI();
		}
	});
	socket.on("user_typing", (data: { conversationId: number; userId: number; isTyping: boolean }) => {
		console.log("User typing:", data);
		if (data.conversationId === chatState.currentConversationId && data.userId !== Number(credentials.id)) {
			chatState.isTyping = data.isTyping;
			chatState.typingUserId = data.isTyping ? data.userId : null;
			updateTypingIndicatorUI();
		}
	});
}

function openChat(friend: IUserData) {
	if (!socket) return;

	chatState.currentFriend = friend;
	chatState.messages = [];
	chatState.isTyping = false;
	chatState.typingUserId = null;

	socket.emit("open_chat", {
		senderId: credentials.id,
		receiverId: friend.id
	});
	updateChatHeaderUI();
}

function markMessagesAsSeen() {
	if (!socket || !chatState.currentConversationId || !chatState.currentFriend) return;

	socket.emit("mark_seen", {
		conversationId: chatState.currentConversationId,
		userId: Number(credentials.id),
		otherUserId: Number(chatState.currentFriend.id)
	});
}

function emitTypingStart() {
	if (!socket || !chatState.currentConversationId || !chatState.currentFriend) return;

	socket.emit("typing_start", {
		conversationId: chatState.currentConversationId,
		userId: Number(credentials.id),
		receiverId: Number(chatState.currentFriend.id)
	});
}

function emitTypingStop() {
	if (!socket || !chatState.currentConversationId || !chatState.currentFriend) return;

	socket.emit("typing_stop", {
		conversationId: chatState.currentConversationId,
		userId: Number(credentials.id),
		receiverId: Number(chatState.currentFriend.id)
	});
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
			const seenIcon = isMine ? `
				<span class="ml-1 inline-flex items-center">
					${msg.seen ?
						`<svg class="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
							<path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"/>
						</svg>` :
						`<svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
							<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
						</svg>`
					}
				</span>` : '';
			return /* html */`
				<div class="flex ${isMine ? 'justify-end' : 'justify-start'} mb-3">
					<div class="max-w-[70%] ${isMine ? 'bg-color1 text-bgColor' : 'bg-[#1a1a2e] text-txtColor'}
						px-4 py-2 rounded-2xl ${isMine ? 'rounded-br-sm' : 'rounded-bl-sm'}">
						<p class="text-sm break-words">${msg.content}</p>
						<span class="text-xs ${isMine ? 'text-bgColor/70' : 'text-gray-400'} mt-1 flex items-center justify-end">
							${formatMessageTime(msg.createdAt)}${seenIcon}
						</span>
					</div>
				</div>
			`;
		}).join('');
	}
	updateTypingIndicatorUI();
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
				<span id="chat-status-text" class="${chatState.currentFriend.status === 'ONLINE' ? 'text-green-500' : 'text-gray-400'} text-sm">
					${chatState.isTyping ? 'typing...' : (chatState.currentFriend.status || 'offline')}
				</span>
			</div>
		</div>
	`;
}

function updateTypingIndicatorUI() {
	const statusText = document.getElementById('chat-status-text');
	const messagesContainer = document.getElementById('private-chat-messages');

	if (statusText && chatState.currentFriend) {
		if (chatState.isTyping) {
			statusText.textContent = 'typing...';
			statusText.className = 'text-color1 text-sm animate-pulse';
		} else {
			statusText.textContent = chatState.currentFriend.status || 'offline';
			statusText.className = `${chatState.currentFriend.status === 'ONLINE' ? 'text-green-500' : 'text-gray-400'} text-sm`;
		}
	}

	if (messagesContainer) {
		const existingTypingBubble = document.getElementById('typing-bubble');
		if (chatState.isTyping && !existingTypingBubble) {
			const typingBubble = document.createElement('div');
			typingBubble.id = 'typing-bubble';
			typingBubble.className = 'flex justify-start mb-3';
			typingBubble.innerHTML = /* html */`
				<div class="bg-[#1a1a2e] text-txtColor px-4 py-3 rounded-2xl rounded-bl-sm">
					<div class="flex gap-1">
						<span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
						<span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
						<span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
					</div>
				</div>
			`;
			messagesContainer.appendChild(typingBubble);
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		} else if (!chatState.isTyping && existingTypingBubble) {
			existingTypingBubble.remove();
		}
	}
}

function updateUnreadIndicatorsUI() {
	const friendsList = document.getElementById('friends-list');
	if (!friendsList) return;

	friendsList.querySelectorAll('[data-friend-id]').forEach(el => {
		const friendId = el.getAttribute('data-friend-id');
		const existingDot = el.querySelector('.unread-dot');

		const unreadCount = chatState.unreadCounts.get(Number(friendId)) || 0;
		const hasUnread = unreadCount > 0;

		if (existingDot) {
			existingDot.remove();
		}

		if (hasUnread) {
			const dot = document.createElement('div');
			dot.className = 'unread-dot absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full';
			el.classList.add('relative');
			el.appendChild(dot);
		}
	});
}

function setupChatEventListeners() {
	const sendBtn = document.getElementById('private-chat-send');
	const input = document.getElementById('private-chat-input') as HTMLInputElement;

	if (sendBtn) {
		sendBtn.addEventListener('click', () => {
			if (input && input.value.trim()) {
				sendMessage(input.value);
				input.value = '';
				emitTypingStop();
				if (typingTimeout) {
					clearTimeout(typingTimeout);
					typingTimeout = null;
				}
			}
		});
	}
	if (input) {
		input.addEventListener('keypress', (e) => {
			if (e.key === 'Enter' && input.value.trim()) {
				sendMessage(input.value);
				input.value = '';
				emitTypingStop();
				if (typingTimeout) {
					clearTimeout(typingTimeout);
					typingTimeout = null;
				}
			}
		});

		input.addEventListener('input', () => {
			if (input.value.trim()) {
				emitTypingStart();

				if (typingTimeout) {
					clearTimeout(typingTimeout);
				}

				typingTimeout = setTimeout(() => {
					emitTypingStop();
				}, 2000);
			} else {
				emitTypingStop();
				if (typingTimeout) {
					clearTimeout(typingTimeout);
					typingTimeout = null;
				}
			}
		});
	}
}

function setupFriendsClickListeners() {
	const friendsList = document.getElementById('friends-list');
	if (!friendsList) return;

	friendsList.querySelectorAll('[data-friend-id]').forEach(el => {
		const friendId = el.getAttribute('data-friend-id');
		const friend = chatState.friends.find(f => String(f.id) === friendId);

		const usernameLink = el.querySelector('.username-link');
		if (usernameLink && friendId) {
			usernameLink.addEventListener('click', (e) => {
				e.stopPropagation();
				navigate(`/profile/${friendId}`);
			});
		}
		el.addEventListener('click', () => {
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

function updateFriendStatusUI(friendId: string, status: 'ONLINE' | 'OFFLINE'): void {
	const friend = chatState.friends.find(f => String(f.id) === friendId);
	if (friend) {
		friend.status = status;
	}

	const friendElement = document.querySelector(`[data-friend-id="${friendId}"]`);
	if (friendElement) {
		const statusDot = friendElement.querySelector('.status-dot');
		const statusText = friendElement.querySelector('.status-text');

		if (statusDot) {
			statusDot.classList.remove('bg-green-500', 'bg-gray-400');
			statusDot.classList.add(status === 'ONLINE' ? 'bg-green-500' : 'bg-gray-400');
		}
		if (statusText) {
			statusText.classList.remove('text-green-500', 'text-gray-400');
			statusText.classList.add(status === 'ONLINE' ? 'text-green-500' : 'text-gray-400');
			statusText.textContent = status.toLowerCase();
		}
	}

	if (chatState.currentFriend && String(chatState.currentFriend.id) === friendId) {
		chatState.currentFriend.status = status;
		updateChatHeaderUI();
	}
}

export function cleanupPrivateChat() {
	if (socket) {
		socket.removeAllListeners();
		socket.disconnect();
		socket = null;
	}
	if (friendStatusUnsubscribe) {
		friendStatusUnsubscribe();
		friendStatusUnsubscribe = null;
	}
	if (typingTimeout) {
		clearTimeout(typingTimeout);
		typingTimeout = null;
	}
	chatState.currentConversationId = null;
	chatState.currentFriend = null;
	chatState.messages = [];
	chatState.friends = [];
	chatState.isTyping = false;
	chatState.typingUserId = null;
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
									<span class="username-link text-txtColor font-bold text-lg hover:text-color1 transition-colors">${shortString(friend.username, 15)}</span>
									<span class="status-dot w-2 h-2 mt-2 rounded-full ${friend.status === 'ONLINE' ? 'bg-green-500' : 'bg-gray-400'}"></span>
								</div>
								<p class="status-text text-sm ${friend.status === 'ONLINE' ? 'text-green-500' : 'text-gray-400'}">${friend.status?.toLocaleLowerCase() || 'offline'}</p>
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
	loadUnreadFromStorage();
	updateMessageIconBadge();
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
		updateUnreadIndicatorsUI();
	}, 0);

	if (friendStatusUnsubscribe)
		friendStatusUnsubscribe();
	friendStatusUnsubscribe = subscribeFriendStatus(updateFriendStatusUI);
}