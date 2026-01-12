import { navigate } from '../../router';
import * as data from '../dashboard';
import { shortString, formatMessageTime } from '../utils';
import { credentials, getImageUrl, IUserData, userData } from '../store';
import { apiFetch } from '../components/errorsHandler';
import { toastInfo, toastError } from '../components/toast';
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
	if (notificationSocketInitialized && socket?.connected) return;

	initUnreadFromStorage();
	
	if (!socket) {
		socket = io({
			path: '/api/chat/private/socket.io',
			transports: ['websocket', 'polling'],
		});
	}
	
	socket.off("connect");
	socket.off("connect_error");
	socket.off("disconnect");
	socket.off("new_notification");
	socket.off("unread_messages");
	socket.off("all_unread_counts");
	socket.off("error");
	
	socket.on("connect", () => {
		console.log("Connected to private chat");
		socket?.emit("userId", credentials.id);
	});
	socket.on("connect_error", (error) => {console.error("Socket connection error:", error.message);});
	socket.on("disconnect", (reason) => {console.log("Disconnected from private chat:", reason);});
	socket.on("new_notification", (data: { type: string; from: number; conversationId: number; text: string }) => {
		if (data.type === "NEW_MESSAGE" && !window.location.pathname.includes('/chat'))
			toastInfo(`New message received!`, { duration: 4000 });
	});
	socket.on("unread_messages", (data: { conversationId: number; friendId: number; unreadCount: number; hasUnread: boolean }) => {
		if (data.hasUnread && data.friendId)
			chatState.unreadCounts.set(data.friendId, data.unreadCount);
		else if (data.friendId)
			chatState.unreadCounts.delete(data.friendId);
		saveUnreadToStorage();
		updateMessageIconBadge();
		updateUnreadIndicatorsUI();
	});
	socket.on("all_unread_counts", (data: { unreadCounts: { conversationId: number; friendId: number; unreadCount: number }[] }) => {
		chatState.unreadCounts.clear();
		data.unreadCounts.forEach(item => {
			if (item.friendId)
				chatState.unreadCounts.set(item.friendId, item.unreadCount);
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
		updateMessagesUI();
		markMessagesAsSeen();
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

	chatState.unreadCounts.delete(Number(friend.id));
	saveUnreadToStorage();
	updateMessageIconBadge();
	updateUnreadIndicatorsUI();

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

	const trimmedContent = content.trim();
	if (trimmedContent.length > 200) {
		toastError('Message is too long. Maximum 200 characters allowed.');
		return;
	}

	socket.emit("send_message", {
		conversationId: chatState.currentConversationId,
		senderId: Number(credentials.id),
		receiverId: Number(chatState.currentFriend.id),
		content: trimmedContent
	});
	const optimisticMessage: ChatMessage = {
		senderId: Number(credentials.id),
		content: trimmedContent,
		conversationId: chatState.currentConversationId,
		createdAt: new Date().toISOString()
	};
	chatState.messages.push(optimisticMessage);
	updateMessagesUI();
}

interface RoomData {
	roomId: string;
	PlayerID: string;
	playerName: string | null;
	playerAvatar: string | null;
}

async function challengeFriend() {
	if (!chatState.currentFriend) {
		toastError('No friend selected to challenge');
		return;
	}

	if (chatState.currentFriend.status !== 'ONLINE') {
		toastInfo('Your friend is offline. They can join when they come online!');
	}

	const { data: roomData, error } = await apiFetch<{ roomId: string }>('/api/game/friendly-match');
	
	if (error || !roomData) {
		toastError('Failed to create game room. Please try again.');
		return;
	}

	const challengeMessage = `🎮 I challenge you to a Pong match! Join room: ${roomData.roomId}`;
	sendMessage(challengeMessage);

	const sessionData: RoomData = {
		roomId: roomData.roomId,
		PlayerID: String(userData.id),
		playerName: shortString(userData.username, 12) || '',
		playerAvatar: getImageUrl(userData.avatar_url) || '/game/Assets/default.png'
	};
	sessionStorage.setItem('room', JSON.stringify(sessionData));

	navigate('/pong-game?mode=online-matchmaking');
}

function extractRoomId(content: string): string | null {
	const match = content.match(/Join room: ([a-zA-Z0-9-]+)/);
	return match ? match[1] : null;
}

function isChallengeMessage(content: string): boolean {
	return content.includes('🎮') && content.includes('Join room:');
}

async function joinGameRoom(roomId: string) {
	const { data, error } = await apiFetch<{ exists: boolean }>(`/api/game/room/${roomId}`);
	
	if (error || !data) {
		toastError('Failed to check room availability. Please try again.');
		return;
	}

	if (!data.exists) {
		toastInfo('Room is no longer available.');
		return;
	}

	const sessionData: RoomData = {
		roomId: roomId,
		PlayerID: String(userData.id),
		playerName: shortString(userData.username, 12) || '',
		playerAvatar: getImageUrl(userData.avatar_url) || '/game/Assets/default.png'
	};
	sessionStorage.setItem('room', JSON.stringify(sessionData));

	navigate('/pong-game?mode=online-matchmaking');
}

function renderChallengeMessage(msg: ChatMessage, isMine: boolean, seenIcon: string): string {
	const roomId = extractRoomId(msg.content);
	
	if (isMine) {
		return /* html */`
			<div class="flex justify-end mb-3">
				<div class="max-w-[70%] bg-color1 text-bgColor px-4 py-2 rounded-2xl rounded-br-sm">
					<div class="flex items-center gap-2 mb-1">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
								d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
								d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
						</svg>
						<span class="font-bold">Challenge Sent!</span>
					</div>
					<p class="text-sm">Waiting for opponent to join...</p>
					<span class="text-xs text-bgColor/70 mt-1 flex items-center justify-end">
						${formatMessageTime(msg.createdAt)}${seenIcon}
					</span>
				</div>
			</div>
		`;
	} else {
		return /* html */`
			<div class="flex justify-start mb-3">
				<div class="max-w-[70%] bg-gradient-to-r from-[#1a1a2e] to-[#2a1a3e] text-txtColor 
					px-4 py-3 rounded-2xl rounded-bl-sm border border-color1/30">
					<div class="flex items-center gap-2 mb-2">
						<svg class="w-5 h-5 text-color1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
								d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
								d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
						</svg>
						<span class="font-bold text-color1">Game Challenge!</span>
					</div>
					<p class="text-sm mb-3">You've been challenged to a Pong match!</p>
					<button data-room-id="${roomId}" 
						class="join-game-btn w-full bg-color1 hover:bg-color2 text-bgColor font-bold 
						py-2 px-4 rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
								d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
						</svg>
						Join Game
					</button>
					<span class="text-xs text-gray-400 mt-2 flex items-center justify-end">
						${formatMessageTime(msg.createdAt)}
					</span>
				</div>
			</div>
		`;
	}
}

function setupJoinGameListeners() {
	const joinButtons = document.querySelectorAll('.join-game-btn');
	joinButtons.forEach(btn => {
		btn.addEventListener('click', async (e) => {
			const target = e.currentTarget as HTMLElement;
			const roomId = target.getAttribute('data-room-id');
			if (roomId) {
				await joinGameRoom(roomId);
			}
		});
	});
}

function updateMessagesUI() {
	const messagesContainer = document.getElementById('private-chat-messages');
	const input = document.getElementById('private-chat-input-div') as HTMLElement;
	console.log("called by  : ", input);
	if (input && chatState.currentConversationId)
		input.classList.remove("hidden");
	else if (input)
		input.classList.add("hidden");

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
			
			if (isChallengeMessage(msg.content)) {
				return renderChallengeMessage(msg, isMine, seenIcon);
			}
			
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
	setupJoinGameListeners();
	messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function updateChatHeaderUI() {
	const chatHeader = document.getElementById('private-chat-header');
	if (!chatHeader || !chatState.currentFriend) return;
	chatHeader.innerHTML = /* html */`
		<div class="flex justify-between items-center w-full">
			<div class="flex gap-3 font-bold items-center">
				<img class="h-12 w-12 rounded-full object-cover"
					src="${getImageUrl(chatState.currentFriend.avatar_url) || '/images/default-avatar.png'}">
				<div class="flex flex-col">
					<span class="text-txtColor text-lg">${shortString(chatState.currentFriend.username, 20)}</span>
					<span id="chat-status-text" class="${chatState.currentFriend.status === 'ONLINE' ? 'text-green-500' : 'text-gray-400'} text-sm">
						${chatState.isTyping ? 'Typing...' : (chatState.currentFriend.status === "ONLINE" ? "Online"  : "Offline")}
					</span>
				</div>
			</div>
			<button id="challenge-btn" 
				class="flex items-center gap-2 bg-color1 hover:bg-color2 text-bgColor font-bold 
				px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105">
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
						d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
						d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
				</svg>
				<span>Challenge</span>
			</button>
		</div>
	`;
	setupChallengeButtonListener();
}

function setupChallengeButtonListener() {
	const challengeBtn = document.getElementById('challenge-btn');
	if (challengeBtn) {
		challengeBtn.addEventListener('click', challengeFriend);
	}
}

function updateTypingIndicatorUI() {
	const statusText = document.getElementById('chat-status-text');
	const messagesContainer = document.getElementById('private-chat-messages');

	if (statusText && chatState.currentFriend) {
		if (chatState.isTyping) {
			statusText.textContent = 'Typing...';
			statusText.className = 'text-color1 text-sm animate-pulse';
		} else {
			statusText.textContent = chatState.currentFriend.status ===  "ONLINE" ? "Online"  : "Offline";
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
		if (existingDot) existingDot.remove();
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
				if (typingTimeout) clearTimeout(typingTimeout);
				typingTimeout = setTimeout(() => {emitTypingStop();}, 2000);
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
		socket.off("chat_initialized");
		socket.off("receive_message");
		socket.off("message_sent");
		socket.off("messages_seen");
		socket.off("user_typing");
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
}

export function disconnectChatSocket() {
	if (socket) {
		socket.removeAllListeners();
		socket.disconnect();
		socket = null;
	}
	notificationSocketInitialized = false;
	chatState.unreadCounts.clear();
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
				<h2 class="text-txtColor text-2xl font-bold mb-2">Messages</h2>
				<div class="h-[1px] bg-gray-700 mb-4"></div>
			</div>
			<div class="bg-[url('/images/space.png')] bg-center flex flex-col h-full rounded-2xl">
				<div id="private-chat-header" class=" rounded-t-2xl p-3 border-b border-gray-700">
					<div class="flex gap-3 font-bold items-center text-gray-400">
						<p>Select a friend to start chatting</p>
					</div>
				</div>
				<div id="private-chat-messages" class="flex-1 p-4 overflow-y-auto min-h-[300px] max-h-[calc(100vh-450px)]
					scrollbar-thin scrollbar-thumb-color1 scrollbar-track-transparent hover:scrollbar-thumb-color2 pr-2">
					<div class="flex items-center justify-center h-full text-gray-400">
						<img class="w-[70%] opacity-[50%]" src="/images/chat.gif" alt="Idle">

					</div>
				</div>
				<div class="flex justify-center gap-2 mt-0 w-full items-center  rounded-b-2xl p-3 hidden" id="private-chat-input-div">
					<input type="text" id="private-chat-input" placeholder="Type a message..."
					class="bg-[#0f0f1a] text-txtColor px-4 py-2 rounded-full w-[80%]
					outline-none border border-color3 focus:border-color1 transition-colors
					"
					>
					<button id="private-chat-send"
						class="bg-color1 hover:bg-color2 h-10 w-10 rounded-full flex items-center justify-center
						transition-all duration-300 hover:scale-105 "
						>
						<svg class="w-5 h-5 text-bgColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
						</svg>
					</button>
				</div>
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
								</div>
								<p class="status-text text-sm ${friend.status === 'ONLINE' ? 'text-green-500' : 'text-gray-400'}">${friend.status ===  "ONLINE" ? "Online"  : "Offline"}</p>
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
				<h2 class="text-txtColor font-bold mb-2 text-2xl">Friends</h2>
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