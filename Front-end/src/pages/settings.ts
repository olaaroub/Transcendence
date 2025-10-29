
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
		<div class="avatar-settings px-5 border border-color2 rounded-2xl bg-color4 mb-3">
			<p class="border-b text-color1 font-bold text-sm 2xl:text-lg border-color2 py-4 mb-5">Edit your avatar</p>
			<div class="flex gap-3 mb-6">
				<img src="${data.imageUrl}" class=" w-[80px] h-[80px] rounded-full border-2
				border-color1" alt="user" />
				<div class="flex flex-col gap-2">
					<p class="text-xs 2xl:text-sm text-txtColor">Upload a new avatar</p>
					<div class=" space-x-3 rounded-2xl p-2 px-3 border border-color2">
						<label class="bg-color1 rounded-3xl text-black px-3 py-1 text-xs cursor-pointer" for="upload-avatar">
							<input
							id = "upload-avatar"
							type="file"
							class="hidden"
							><img class="inline relative transform -translate-y-[10%]" src="images/upload.svg" alt="">
							<span>Choose file</span>
						</label>
						<span id="file-name" class="sm:inline text-xs hidden text-txtColor">No files selected<span>
					</div>
					<p class="text-[#878787] text-xs">JPEG 100x100</p>
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

function editingProfile() : string
{
	return `
		<div class="avatar-settings px-5 border border-color2 rounded-2xl mb-3 flex bg-color4 flex-col gap-4">
			<p class="border-b text-color1 font-bold text-sm 2xl:text-lg border-color2 py-4 mb-5">Account Settings</p>
			<div class="settings-name flex flex-col gap-2">
				<p class="text-txtColor text-sm">username</p>
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
		<div class="avatar-settings px-5 border border-color2 rounded-2xl mb-3 flex bg-color4 flex-col gap-4">
			<p class="border-b text-color1 font-bold text-sm 2xl:text-lg border-color2 py-4 mb-5">Security</p>
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
		<div class="avatar-settings px-5 border border-color2 rounded-2xl mb-3 flex bg-color4 flex-col gap-4">
			<p class="border-b text-color1 font-bold text-sm 2xl:text-lg border-color2 py-4 mb-5">Account</p>
			<p class="text-white">Permanently delete your account and all associated data. This action cannot be undone.</p>
			<button class="bg-red-500 text-white w-full md:w-[40%] rounded-xl py-2 px-4 mb-6 hover:bg-red-600">Delete Account</button>
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
		<div class="sm:px-16 settings flex-1">
			<h1 class="text-txtColor font-bold text-2xl 2xl:text-4xl mb-[30px]">Settings</h1>
			${avatarSettings()}
			${editingProfile()}
			${security()}
			${Account()}
			<button class="w-[160px] h-[40px] mb-6 rounded-3xl font-bold
			text-black text-sm bg-color1 hover:scale-105">Save Changes</button>
		</div>
	`;
	sendAvatar();
}
