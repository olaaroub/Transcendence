import { navigate } from "../../router";
import { closeNotificationSocket } from "./NavBar";
import { cleanupGlobalChat } from "../chat/globalChat";
import { cleanupPrivateChat, disconnectChatSocket } from "../chat/chat";

export function logout()
{
    closeNotificationSocket();
    cleanupGlobalChat();
    cleanupPrivateChat();
    disconnectChatSocket();
    localStorage.removeItem('token');
    localStorage.removeItem('id');
	navigate('/login');
}

export function renderProfileMenu () : HTMLElement 
{
    const profileMenu = [
        {icon: '/images/profile.svg', label: "Profile"},
        {icon: '/images/settings.svg', label: "Settings"},
        {icon: '/images/logout.svg', label: "Logout"},
    ]

    const divMenu = document.createElement('div');
    divMenu.className = `profile-menu w-[200px] absolute z-50 right-0 top-full mt-2
                        bg-black/90 backdrop-blur-md border border-borderColor
                        rounded-2xl py-2 shadow-lg`;
    
    profileMenu.forEach((item) => {
        const div = document.createElement('div');
        const isLogout = item.label === 'Logout';
        
        div.className = `flex items-center gap-3 mx-2 px-4 py-3 rounded-xl cursor-pointer
                        transition-colors duration-200
                        ${isLogout ? 'hover:bg-red-500/20 mt-1' : 'hover:bg-color1/20'}`;
        
        div.addEventListener('click', _=>{
            const menu = document.querySelector('.profile-menu');
			if (menu) menu.remove();
            if (item.label === 'Logout')
                logout();
            else if (item.label === 'Profile')
                navigate(`/profile/${localStorage.getItem('id')}`);
            else
                navigate(`/${item.label}`.toLowerCase());
        })
        
        const img = document.createElement('img');
        img.className = `w-5 h-5`;
        img.src = item.icon;

        const span = document.createElement('span');
        span.textContent = item.label;
        span.className = `text-txtColor text-sm font-medium ${isLogout ? 'text-red-400' : ''}`;

        div.appendChild(img);
        div.appendChild(span);
        divMenu.appendChild(div);
    })
    
    divMenu.addEventListener('click', (e) => e.stopPropagation());
    return divMenu;
}
