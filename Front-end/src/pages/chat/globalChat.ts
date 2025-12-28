import { mockMessages } from "./mockMessages";
import { credentials, IUserData } from "../store";

// const wsUrl = `ws://localhost:3002/api/chat/global/${credentials.id}`;
// const golobalChatSocket = new WebSocket(wsUrl);

// golobalChatSocket.onopen = () => {
// 	console.log('WebSocket connection established for global chat');
// }

// golobalChatSocket.onmessage = (event) => {
//     console.log("golobal chat message recieved");
// }

// golobalChatSocket.onerror = (error) =>{
//     console.error("global chat websocket error", error);
// }

// golobalChatSocket.onclose = (event) => {
// 	console.log('WebSocket connection closed:', event.code, event.reason);
// };

let users: IUserData[] = [];
try
{
	const response = await fetch(`/api/chat/global/messages`, {
		headers: {"Authorization": `Bearer ${localStorage.getItem('token')}`},
	});
	if (!response.ok)
	{
		console.error('Failed to fetch prev messages in global chat', response.statusText);
	}
	users = await response.json();
} catch(err){
	console.error('Error fetching prev messages in global chat:', err);
}

console.log("global chat users : ", users);

function renderChat() : string
{ 
	return `
		<div class="bg-color4 glow-effect hover:bg-[rgb(0_0_0_/_80%)] transition-all duration-300 
			py-6 px-6 flex flex-col rounded-3xl h-[509px] border border-borderColor">
			<div class="flex items-center justify-between pb-4 border-b border-borderColor mb-4">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-full bg-color1/20 flex items-center justify-center">
						<svg class="w-5 h-5 text-color1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path>
						</svg>
					</div>
					<div>
						<p class="text-txtColor font-semibold">Global Chat</p>
						<p class="text-color3 text-xs">${mockMessages.length} messages</p>
					</div>
				</div>
				<div class="flex items-center gap-2">
					<span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
					<span class="text-color3 text-xs">Live</span>
				</div>
			</div>
			<div class="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-color1 scrollbar-track-transparent
				hover:scrollbar-thumb-color2 pr-2 space-y-4">
				${mockMessages.map(msg => `
					<div class="group hover:bg-white/5 rounded-xl p-2 -mx-2 transition-colors duration-200">
						<div class="flex items-start gap-3">
							<img src="${msg.avatar}" class="w-9 h-9 rounded-full border border-borderColor 
								group-hover:border-color1 transition-colors duration-200" alt="${msg.senderName}">
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2 mb-1">
									<span class="text-txtColor font-semibold text-sm hover:text-color1 
										cursor-pointer transition-colors">${msg.senderName}</span>
									<span class="text-color3 text-xs">${new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
								</div>
								<p class="text-txtColor/80 text-sm leading-relaxed break-words">${msg.content}</p>
							</div>
						</div>
					</div>
				`).join('')}
			</div>
			
			<!-- Input Area -->
			<div class="mt-4 pt-4 border-t border-borderColor">
				<div class="flex gap-3 items-center">
					<input type="text" id="global-chat-input" placeholder="Type a message..." 
						class="flex-1 bg-black/50 text-txtColor px-5 py-3 rounded-xl 
						outline-none border border-borderColor focus:border-color1 
						transition-colors placeholder:text-color3 text-sm">
					<button id="global-chat-send" class="bg-color1 hover:bg-color2 w-11 h-11 
						rounded-xl flex items-center justify-center
						transition-all duration-300 hover:scale-105">
						<svg class="w-5 h-5 text-bgColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
						</svg>
					</button>
				</div>
			</div>
		</div>
	`
}

export function renderGlobalChat(): string {
	return `
		<div class="group-chat w-full md:w-[50%] hidden md:block">
			<h2 class="text-txtColor font-bold text-2xl mb-4">Global Chat</h2>
			${renderChat()}
		</div>
	`;
}
