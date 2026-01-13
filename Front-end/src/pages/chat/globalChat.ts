import { credentials, getImageUrl, userData } from "../store";
import { apiFetch } from "../components/errorsHandler";
import { formatMessageTime, shortString } from "../utils";
import { navigate } from "../../router";
import { toastError } from "../components/toast";

interface ChatMessage {
	sender_id: string | number;
	username: string;
	avatar_url: string;
	msg: string;
	created_at: string;
}

let globalChatMessages: ChatMessage[] = [];
let golobalChatSocket: WebSocket | null = null;
let globalChatInitialized = false;

async function fetchPreviousMessages() {
	const { data } = await apiFetch<ChatMessage[]>(`/api/chat/global/messages`);
	if (data) {
		globalChatMessages = data;
		globalChatMessages.reverse();
		updateChatUI();
	}
}

function initializeWebSocket() {
	if (globalChatInitialized && golobalChatSocket && 
		golobalChatSocket.readyState === WebSocket.OPEN) {
		return;
	}
	if (golobalChatSocket && golobalChatSocket.readyState === WebSocket.CONNECTING) return;
	if (golobalChatSocket && golobalChatSocket.readyState !== WebSocket.OPEN) {
		golobalChatSocket.close();
		golobalChatSocket = null;
	}
	if (golobalChatSocket && golobalChatSocket.readyState === WebSocket.OPEN) return;
	const token = localStorage.getItem('token');
	const wsUrl = `wss://${window.location.host}/api/chat/global/${credentials.id}?token=${token}`;
	golobalChatSocket = new WebSocket(wsUrl);

	golobalChatSocket.onopen = () => {
		globalChatInitialized = true;
	}
	golobalChatSocket.onmessage = (event) => {
		try {
			const data = JSON.parse(event.data);

			if (data.type === 'MESSAGE_SENT_SUCCESSFULLY') {
				return;
			}
			const message: ChatMessage = data;
			if (String(message.sender_id) === String(credentials.id)) {
				return;
			}
			if (message.msg && message.msg.trim()) {
				globalChatMessages.push(message);
				updateChatUI();
			}
		} catch(err) {console.error('Error parsing WebSocket message:', err);}
	}

	golobalChatSocket.onerror = (error) => {console.error("global chat websocket error", error);}
	golobalChatSocket.onclose = (event) => {
		globalChatInitialized = false;
		golobalChatSocket = null;
	};
}

function updateChatUI() {
	const chatContainer = document.getElementById('global-chat-messages');
	const chatCount = document.getElementById('global-chat-count');

	if (!chatContainer) return;
	chatContainer.innerHTML = renderChatMessages();
	if (chatCount)
		chatCount.textContent = `${globalChatMessages.length} messages`;
	chatContainer.scrollTop = chatContainer.scrollHeight;
	chatContainer.querySelectorAll('.username-link').forEach(el => {
		el.addEventListener('click', () => {
			const userId = el.getAttribute('data-user-id');
			if (userId) navigate(`/profile/${userId}`);
		});
	});
}

function renderChatMessages(): string {
	return globalChatMessages.map(msg => {
		const isSystemUser = msg.username?.toLowerCase() === 'system' || !msg.sender_id;
		return /* html */`
		<div class="group hover:bg-white/5 rounded-xl p-2 -mx-2 transition-colors duration-200">
			<div class="flex items-start gap-3">
				<img src="${getImageUrl(msg.avatar_url)}" class="w-9 h-9 rounded-full border border-borderColor
					group-hover:border-color1 transition-colors duration-200" alt="${msg.username}">
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-2 mb-1">
						${isSystemUser 
							? `<span class="text-txtColor font-semibold text-sm">${msg.username}</span>`
							: `<span data-user-id="${msg.sender_id}" class="username-link text-txtColor font-semibold text-sm hover:text-color1
								cursor-pointer transition-colors">${shortString(msg.username, 15)}</span>`
						}
						<span class="text-color3 text-xs">${formatMessageTime(msg.created_at)}</span>
					</div>
					<p class="text-txtColor/80 text-sm leading-relaxed break-words">${msg.msg}</p>
				</div>
			</div>
		</div>
	`}).join('');
}

function sendMessage(content: string) {
	if (!golobalChatSocket || golobalChatSocket.readyState !== WebSocket.OPEN) {
		console.error('WebSocket is not connected');
		return;
	}
	const trimmedContent = content.trim();
	if (trimmedContent.length > 200) {
		toastError('Message is too long. Maximum 200 characters allowed.');
		return;
	}

	const optimisticMessage: ChatMessage = {
		sender_id: Number(credentials.id),
		username: userData.username || 'You',
		avatar_url: userData.avatar_url || '',
		msg: trimmedContent,
		created_at: new Date().toISOString()
	};
	globalChatMessages.push(optimisticMessage);
	updateChatUI();
	golobalChatSocket.send(JSON.stringify({msg: trimmedContent}));
}

function setupChatEventListeners() {
	const input = document.getElementById('global-chat-input') as HTMLInputElement;
	const sendBtn = document.getElementById('global-chat-send');

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

function renderChat() : string
{
	return /* html */`
		<div class="bg-color4 glow-effect hover:bg-[rgb(0_0_0_/_80%)] transition-all duration-300
			py-6 px-6 flex flex-col rounded-3xl h-[509px] border border-borderColor">
			<div class="flex items-center justify-between pb-4 border-b border-borderColor mb-4">
				<div class="flex items-center gap-3">
					<img class="w-10 h-10 " src="images/chat.svg">
					<h2 class="text-txtColor font-semibold">Global Chat</h2>
				</div>
				<div class="flex items-center gap-2">
					<span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
					<span class="text-color3 text-xs">Live</span>
				</div>
			</div>
			<div id="global-chat-messages" class="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-color1 scrollbar-track-transparent
				hover:scrollbar-thumb-color2 pr-2">
				${renderChatMessages()}
			</div>

			<div class="mt-4 pt-4 border-t border-borderColor">
				<div class="flex gap-3 items-center">
					<input type="text" id="global-chat-input" placeholder="Type a message..."
						class="flex-1 bg-black/50 text-txtColor px-5 py-3 rounded-xl
						outline-none border border-borderColor focus:border-color1
						transition-colors placeholder:text-color3 text-sm">
						<img id="global-chat-send" class="w-11 h-11 text-bgColor rotate-[90deg] border border-borderColor
						 hover:scale-[1.1] transition duration-200 bg-[linear-gradient(90deg,#0f0f1a,#111111)] rounded-xl p-1" src="images/send.svg">
				</div>
			</div>
		</div>
	`
}

export function renderGlobalChat(): string {
	setTimeout(() => {
		fetchPreviousMessages();
		initializeWebSocket();
		setupChatEventListeners();
	}, 0);

	return /* html */`
		<div class="group-chat w-full md:w-[50%]">
			<h2 class="text-txtColor font-bold text-2xl mb-4">Social</h2>
			${renderChat()}
		</div>
	`;
}

export function cleanupGlobalChat() {
	if (golobalChatSocket) {
		golobalChatSocket.close();
		golobalChatSocket = null;
	}
	globalChatInitialized = false;
}
