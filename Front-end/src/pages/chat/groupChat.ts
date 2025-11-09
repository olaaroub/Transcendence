import { mockMessages } from "./mockMessages";

function renderChat() : string
{
    return `
        <div class="bg-color4 py-6 px-12 flex flex-col rounded-3xl h-[509px]">
            <div class="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-color1 bg-[#172232] scrollbar-track-color4 
            hover:scrollbar-thumb-color2 scrollbar-thumb-rounded rounded-2xl pt-6 px-3 pr-2">
                ${mockMessages.map(msg => `
                    <div class="mb-4">
                        <div class="flex items-start gap-3">
                            <img src="${msg.avatar}" class="w-8 h-8 rounded-full" alt="${msg.senderName}">
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="text-txtColor font-semibold text-sm">${msg.senderName}</span>
                                    <span class="text-gray-500 text-xs">${new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p class="text-gray-300 text-sm">${msg.content}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="mt-4 flex gap-2">
                <input type="text" placeholder="Type a message..." 
                class="flex-1 bg-bgColor text-txtColor px-4 py-2 rounded-full 
                outline-none border border-color3 focus:border-color1 transition-colors">
                <button class="bg-gradient-to-r from-color1 to-color2 px-6 py-2 
                rounded-full font-semibold hover:scale-105 transition-transform">
                    Send
                </button>
            </div>
        </div>
    `
}

export function renderGroupChat(): string {
    return `
        <div class="group-chat w-full md:w-[47%] hidden md:block">
            <h2 class="text-txtColor font-bold text-2xl mb-4">Group Chat</h2>
            ${renderChat()}
        </div>
    `;
}
