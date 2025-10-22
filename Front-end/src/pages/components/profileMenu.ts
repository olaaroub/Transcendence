import { navigate } from "../../router";

export function logout()
{
	navigate('/login');
}

export function renderProfileMenu () : HTMLElement 
{
    const profileMenu = [
        {icon: '/images/profile.svg', lable: "Profile"},
        {icon: '/images/settings.svg', lable: "Settings"},
        {icon: '/images/logout.svg', lable: "Logout"},
    ]

    const divMenu = document.createElement('div');
    divMenu.className = `profile-menu w-[190px] absolute z-10 h-[154px]
                        space-y-3 bg-color4 border border-[#87878766]
                        rounded-[14px] p-7 mx-auto transform -translate-x-1/3`;
    profileMenu.forEach(item => {
        const div = document.createElement('div');

        div.className = `${item.lable} flex items-center gap-4 text-white`;
        div.addEventListener('click', _=>{
            if (item.lable === 'Logout')
                logout();
            else
                navigate(`/${item.lable}`.toLowerCase());
        })
        const img = document.createElement('img');
        img.className = "w-[20px] h-[20px]";
        img.src = item.icon;

        const span = document.createElement('span');
        span.textContent = item.lable;
        span.className = "hover:text-color1 trasition-colors duration-200";

        div.appendChild(img);
        div.appendChild(span);
        divMenu.appendChild(div);
    })
    divMenu.addEventListener('click', (e) => e.stopPropagation());
    return divMenu;
}
