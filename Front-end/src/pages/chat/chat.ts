import { navigate } from '../../router';
import * as data from '../dashboard';

export function chatEventHandler() {
    const messageIcon = document.getElementById('message-icon');
    if (!messageIcon) return;
    messageIcon.addEventListener('click', async () => {
        navigate('/chat');
    });
}

function renderMessages() : string {
    return `
        <div class="relative w-[70%] bg-color4 rounded-2xl p-6">
            <h2 class="text-txtColor text-2xl font-bold mb-4">Messages</h2>
            <div class="h-[1px] bg-gray-700 mb-4"></div>
            <p class="text-txtColor">No messages to display.</p>
        </div>
        `;
}
export async function renderChat() {
    await data.initDashboard(false);
    const dashContent = document.getElementById('dashboard-content');
    if (dashContent)
        dashContent.innerHTML = `
        <div class="w-full h-full flex ">
            <div class="w-[30%] bg-color4 rounded-2xl p-6 mr-4">
                <div id="search-chat" class="relative mx-2 bg-color4
                    border border-color1 rounded-full
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
                <div class="h-[1px] bg-gray-700 mt-6"></div>
            </div>
            ${renderMessages()}
        </div>
    `;
}