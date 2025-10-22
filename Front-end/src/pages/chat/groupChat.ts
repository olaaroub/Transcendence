import { mockMessages } from "./mockMessages";

function renderChat() : string
{
    return `
        <div class="bg-color4 p-6 rounded-3xl text-txtColor">
            Lorem ipsum dolor sit amet, consectetur adipisicing
            elit. Vitae, illo. Quasi sed, architecto quisquam
            quas eos nostrum, illum unde corrupti,
            excepturi quo modi consequuntur dignissimos rem pariatur
            aperiam aliquid necessitatibus.
        </div>
    `
}

export function renderGroupChat(): string {
    return `
        <div class="group-chat w-1/3 hidden md:block">
            <h2 class="text-txtColor font-bold text-2xl mb-4">Group Chat</h2>
            ${renderChat()}
        </div>
    `;
}