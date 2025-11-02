
import * as data from "./dashboard"
import { IUserData, setUserData, getUserData} from "./store"

const 	userData : IUserData = getUserData();
let newUserData: Partial<IUserData> = {};


function SaveChanges()
{
	const settingsPage = document.getElementById('settings-page');
	if (!settingsPage) return;
	const saveBtn = settingsPage.querySelector('button');
	if (!saveBtn) return;
	saveBtn.addEventListener('click', async () => {
		console.log("New Data to update:", newUserData);
	});
}

function addInputListeners()
{
	document.querySelectorAll('input, textarea, select').forEach((el) => {
		const settingsPage = document.getElementById('settings-page');
		if (!settingsPage) return;
		const element = el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
		element.addEventListener('change', () => {
			const name = element.name;
			const value = element.value;
			if (value !== userData[name as keyof IUserData]) {
				if (name === 'id')
					newUserData[name] = Number(value);
				else
					newUserData[name as keyof IUserData] = value;
			}
			else
				delete newUserData[name as keyof IUserData];
		});
	});
}

function confirmPopUp(message: string) : Promise<boolean>
{
	return new Promise((resolve) => {
		const deletePopUp = document.createElement('div');
		deletePopUp.className = `h-screen absolute w-screen`;
		deletePopUp.innerHTML = `
			<div class="bg-white top-1/2 left-1/2 absolute z-20 transform -translate-x-1/2
			-translate-y-1/2 rounded-2xl p-6 flex flex-col gap-4">
				<p class="font-bold">${message}</p>
				<button id="confirm-btn" class="bg-color1 hover:scale-105 transition-all duration-300 rounded-2xl p-2" id="confirm-delete">Yes</button>
				<button id="cancel-btn" class="bg-color1 hover:scale-105 transition-all duration-300 rounded-2xl p-2" id="cancel-delete">No</button>
			</div>
		`;
		document.body.appendChild(deletePopUp);
		const confirmBtn = deletePopUp.querySelector("#confirm-btn") as HTMLButtonElement;
		const cancelBtn = deletePopUp.querySelector("#cancel-btn") as HTMLButtonElement;

		confirmBtn.addEventListener("click", () => {
			deletePopUp.remove();
			resolve(true);
		});

		cancelBtn.addEventListener("click", () => {
			deletePopUp.remove();
			resolve(false);
		});
	});
}

async function deleteAvatar()
{
	const deleteAvatarBtn = document.getElementById('delete-avatar');
	if(!deleteAvatarBtn)
			return ;
	deleteAvatarBtn.addEventListener('click', async ()=> {
		const confirmed = await confirmPopUp('Are you sure you want to delete your avatar?');
		if (!confirmed) return;
		try
		{
			const response = await fetch(`http://127.0.0.1:3000/users/${userData?.id}/image`, {
				method: 'DELETE',
				headers: {"Authorization": `Bearer ${localStorage.getItem('token')}`},
			});
			if (response.ok) {
				console.log('Avatar deleted successfully');
				renderSettings();
			} else {console.error('Error deleting avatar');}
		}
		catch(err) {console.log("Delete Error", err);}
	});
}

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
			const response = await fetch(`http://127.0.0.1:3000/users/${userData?.id}/image`, {
				method : 'PUT',
				body : formData,
				headers: {"Authorization": `Bearer ${localStorage.getItem('token')}`},
			})
			if (!response.ok) {
				console.error('Error uploading avatar');
				return ;
			}
			renderSettings();
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
					<img id="userAvatar" src="${userData.profileImage}" class="
					w-[150px] h-[150px] xl:w-[200px] xl:h-[200px] rounded-full border-2
					border-color1" alt="user" />
				<span class="text-sm text-color3">max size 2MB</span>
				</div>
				<div class="flex justify-center flex-col gap-6">
						<label class="bg-color1 relative flex items-center
						justify-center gap-2 2xl:w-[250px] 2xl:h-[55px] w-[200px] h-[45px] font-bold
						rounded-2xl text-black px-2 py-1 text-xs cursor-pointer" for="upload-avatar">
							<input
							name="avatar"
							id = "upload-avatar"
							type="file"
							class="hidden">
							<img class="inline relative transform -translate-y-[10%]" src="images/upload.svg" alt="">
							<span class="text-sm font-bold">Upload New Avatar</span>
						</label>
						<button id="delete-avatar" class="border border-color2 2xl:w-[250px] 2xl:h-[55px] w-[200px] h-[45px]
						font-bold rounded-2xl text-txtColor px-3 py-1 text-sm cursor-pointer">Delete Picture</button>
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
				${input("Change username", 'text', userData?.username ?? "", "username")}
			</div>
			<div class="settings-name flex flex-col gap-2 mb-6">
				<p class="text-txtColor text-sm">Your Bio</p>
				<textarea
					name="bio"
					placeholder="Say something about yourself"
					class="bg-transparent placeholder:text-sm text-txtColor border
					border-color2 rounded-2xl h-[100px] p-3 focus:outline-none resize-none focus:border-color1 focus:border-[2px]"
				>${userData.bio}</textarea>
			</div>
		</div>
	`
}

function input(placeholder: string, type: string, value: string = "", name: string) : string
{
	return `
		<input
		value="${value}"
		type="${type}"
		name="${name}"
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
				<div class="flex gap-6 flex-col 2xl:flex-row">
					${input("Current Password", "password", "", "current-password")}
					${input("New Password", "password", "", "new-password")}
					${input("Confirm Password", "password", "", "confirm-password")}
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
				<p class="2xl:w-[60%] w-full text-white">Permanently delete your account and all associated data. This action cannot be undone.</p>
				<button class="bg-red-500 text-white w-full lg:w-[60%] 2xl:w-[40%] rounded-2xl py-4 px-4 mb-6 hover:bg-red-600">Delete Account</button>
			</div>
		</div>
	`
}

export async function renderSettings()
{
	await data.initDashboard(false);
	const dashContent = document.getElementById('dashboard-content');
	if (dashContent)
		dashContent.innerHTML = `
		<div id="settings-page" class="sm:px-16 flex-1 flex flex-col gap-6">
			<div class=" flex flex-row justify-between">
				<h1 class="text-txtColor font-bold text-2xl 2xl:text-4xl">Settings</h1>
				<button class="h-[50px] w-[200px] xl:text-lg rounded-2xl font-bold
				text-black text-sm bg-color1 hover:scale-105">Save Changes</button>
			</div>
			<div class="flex flex-col xl:flex-row gap-6">
				${avatarSettings()}
				${accountSettings()}
			</div>
			<div class="flex flex-col xl:flex-row gap-6">
				${security()}
				${Account()}
			</div>
		</div>
	`;
	addInputListeners();
	SaveChanges();
	// sendAvatar();
	// deleteAvatar();
}
