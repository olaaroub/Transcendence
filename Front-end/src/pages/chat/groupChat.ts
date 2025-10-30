import { mockMessages } from "./mockMessages";

function renderChat() : string
{
    return `
        <div class="bg-color4 py-6 px-20 flex items-stretch rounded-3xl h-[509px]">
            <div class="bg-color4 p-6 rounded-3xl w-full">
            </div>
        </div>
    `
}

export function renderGroupChat(): string {
    return `
        <div class="group-chat w-[60%] hidden md:block">
            <h2 class="text-txtColor font-bold text-2xl mb-4">Group Chat</h2>
            ${renderChat()}
        </div>
    `;
}