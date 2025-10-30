
import * as data from "./dashboard"


function sendAvatar()
{
	const uploadAvatar = document.getElementById('upload-avatar');
	if(!uploadAvatar)
			return ;
	uploadAvatar.addEventListener('change', async (e)=> {
		const target = e.target as HTMLInputElement;
		if (!target.files || target.files.length === 0) return ;
		const file = target.files[0];
		if (file.size > 2097152) {
			alert("Image is too large. Max size 2MB.");
			return;
		}
		const formData = new FormData;
		formData.append("avatar", file);
		try
		{
			console.log(data.userData?.id);
			const response = await fetch(`http://127.0.0.1:3000/users/${data.userData?.id}/update-image`, {
				method : 'POST',
				body : formData,
				headers: {"Authorization": `Bearer ${localStorage.getItem('token')}`},
			})
			if (!response.ok) throw new Error("Upload Failed");
			document.getElementById('file-name')!.textContent = file.name; // must handle too large name
			console.log('upload success');
		}
		catch(err)
		{
			console.log("Upload Error", err);
		}
	})
}

function avatarSettings() : string
{
	return `
		<div class="avatar-settings px-10 py-6 rounded-2xl bg-color4 flex-1 flex flex-col gap-6">
			<p class="text-color1 font-bold text-lg xl:text-2xl">Edit your avatar</p>
			<div class="flex gap-16">
				<div class="flex flex-col items-center gap-2">
					<img src="${data.imageUrl}" class=" w-[200px] h-[200px] rounded-full border-2
					border-color1" alt="user" />
				<span class="text-sm text-color3">max size 2MB</span>
				</div>
				<div class="flex justify-center flex-col gap-6">
						<label class="bg-color1 relative flex items-center
						justify-center gap-2 w-[250px] h-[55px] rounded-2xl text-black px-2 py-1 text-xs cursor-pointer" for="upload-avatar">
							<input
							id = "upload-avatar"
							type="file"
							class="hidden">
							<img class="inline relative transform -translate-y-[10%]" src="images/upload.svg" alt="">
							<span class="text-sm font-bold">Upload New Avatar</span>
						</label>
						<button class="border border-color2 h-[55px] w-[250px] font-bold
						rounded-2xl text-txtColor px-3 py-1 text-sm cursor-pointer">Delete Picture</button>
				</div>
			</div>
		</div>
	`
}

function render2FA() : string
{
	return `
		<div class="flex justify-between mb-6">
			<div class="logo flex gap-3">
				<img src="images/2FA.svg" alt="">
				<h3 class="text-sm text-txtColor" >Activate 2FA <p class="text-xs
				text-color3" >Authentication (2FA) adds an extra layer of security to your account.</p></h3>
			</div>
			<label class="relative inline-flex  cursor-pointer">
				<input type="checkbox" class="sr-only peer" />
				<div
					class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer
					peer-checked:bg-color1 transition-all duration-300">
				</div>
				<div
					class="absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full
					transition-all duration-300 peer-checked:translate-x-5">
				</div>
			</label>
		</div>
	`
}

function accountSettings() : string
{
	return `
		<div class="avatar-settings px-10 py-6 rounded-2xl flex bg-color4 flex-col flex-1 gap-6">
			<p class="text-color1 font-bold text-lg xl:text-2xl">Account Settings</p>
			<div class="settings-name flex flex-col gap-2">
				<p class="text-txtColor text-sm ">username</p>
				${input("Change username", 'text', data.userData?.username)}
			</div>
			<div class="settings-name flex flex-col gap-2 mb-6">
				<p class="text-txtColor text-sm">Your Bio</p>
				<textarea
					placeholder="Say something about yourself"
					class="bg-transparent placeholder:text-sm text-txtColor border
					border-color2 rounded-2xl h-[100px] p-3 focus:outline-none resize-none focus:border-color1 focus:border-[2px]"
				></textarea>
			</div>
		</div>
	`
}

function input(placeholder: string, type: string, value: string = "") : string
{
	return `
		<input
		value="${value}"
		type="${type}"
		placeholder="${placeholder}"
		class="bg-transparent border focus:outline-none focus:border-color1
		focus:border-[2px] text-txtColor w-full placeholder:text-sm border-color2 rounded-2xl p-3"
		>
	`
}

function security() : string
{
	return `
		<div class="avatar-settings px-10 py-6 rounded-2xl flex bg-color4 flex-col gap-6 flex-1">
			<p class=" text-color1 font-bold text-lg xl:text-2xl">Security</p>
			<div class="flex flex-col gap-2">
				<p class="text-txtColor text-sm">Password</p>
				<div class="flex gap-6 flex-col md:flex-row">
					${input("Current Password", "password")}
					${input("New Password", "password")}
					${input("Confirm Password", "password")}
				</div>
			</div>
			${render2FA()}
		</div>
	`

}

function Account() : string
{
	return `
		<div class="avatar-settings px-10 py-6 rounded-2xl flex bg-color4 flex-col gap-6 flex-1">
			<p class="text-color1 font-bold text-lg xl:text-2xl">Account</p>
			<div class="flex flex-col gap-4">
				<p class="lg:w-[60%] text-white">Permanently delete your account and all associated data. This action cannot be undone.</p>
				<button class="bg-red-500 text-white w-full md:w-[40%] rounded-2xl py-4 px-4 mb-6 hover:bg-red-600">Delete Account</button>
			</div>
		</div>
	`
}

export async function renderSettings()
{
	if (!data.userData || !data.userData.id || !data.userData.username)
		await data.initDashboard(false);
	const dashContent = document.getElementById('dashboard-content');
	if (dashContent)
		dashContent.innerHTML = `
		<div class="sm:px-16 settings flex-1 flex flex-col gap-6">
			<div class=" flex flex-row justify-between">
				<h1 class="text-txtColor font-bold text-2xl 2xl:text-4xl">Settings</h1>
				<button class="h-[50px] w-[200px] xl:text-lg rounded-2xl font-bold
				text-black text-sm bg-color1 hover:scale-105">Save Changes</button>
			</div>
			<div class="flex flex-col lg:flex-row gap-6">
				${avatarSettings()}
				${accountSettings()}
			</div>
			<div class="flex flex-col lg:flex-row gap-6">
				${security()}
				${Account()}
			</div>
		</div>
	`;
	sendAvatar();
}
