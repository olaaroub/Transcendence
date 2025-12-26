import * as data from "./dashboard"
import { navigate, navigateBack } from "../router";
import { credentials,IUserData, userData, getImageUrl} from "./store"

const $ = (id : String) => document.getElementById(id as string);

let newUserData: Partial<IUserData> = {};
let body: BodyInit | null = ""; // to learn about this type
let headers : Record<string, string> = {
	"Authorization": `Bearer ${localStorage.getItem('token')}`
}
let avatar : FormData | null = null;

async function checkPasswordChange() : Promise<boolean>
{
	const value = newUserData["new-password" as keyof IUserData];
	const currentPassword = newUserData["current-password" as keyof IUserData];
	const confirmPassword = newUserData["confirm-password" as keyof IUserData];
	if (!value && !currentPassword && !confirmPassword) {
		return true;
	}
	if (!currentPassword) {
		alert('Current password is required to change the password.');
		return false;
	}
	if (!confirmPassword || value !== confirmPassword) {
		alert('Invalid password confirmation.');
		return false;
	}
	try {
		const response = await fetch(`api/auth/${userData?.id}/settings-password`, { // hada zet lih auth
			method: 'PUT',
			body: JSON.stringify({ currentPassword, newPassword: value }),
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${localStorage.getItem('token')}`
			}
		});
		if (!response.ok) {
			alert('Current password is incorrect.');
			return false;
		}
	} catch (error) {
		console.error('Error changing password:', error);
		return false;
	}
	return true;
}

function SaveChanges()
{
	const settingsPage = $('settings-page');
	if (!settingsPage) return;
	const saveBtn = settingsPage.querySelector('#save-changes') as HTMLButtonElement;
	if (!saveBtn) return;
		saveBtn.addEventListener('click', async () => {
			if (Object.keys(newUserData).length === 0) {
				alert('No changes to save.');
				return;
			}
			if (!await checkPasswordChange()) return;
			if (!await confirmPopUp('Do you want to apply these changes?')) return;
			try {
				for (const key of Object.keys(newUserData)) {
					const value = newUserData[key as keyof IUserData];
					if (value === undefined || value === null) {
						delete newUserData[key as keyof IUserData];
						continue;
					}
					if (key === 'current-password' || key === 'new-password' || key === 'confirm-password') {
						delete newUserData[key as keyof IUserData];
						continue;
					}
					else if (key === 'avatar' && avatar) {
						for (const [key, value] of avatar.entries()) {
							console.log(key, value);
						}
						body = avatar;
						delete headers["Content-Type"];
					}
					else {
						body = JSON.stringify({ [key]: value });
						headers["Content-Type"] = "application/json";
					}
					const response = await fetch(`api/user/${userData?.id}/settings-${key}`, {
						method : 'PUT',
						body,
						headers,
					})
					if (!response.ok) {
						alert(`Failed to update ${key}.`);
					} else {
						delete newUserData[key as keyof IUserData];
					}

				}
				navigateBack();
		}catch (err) {
			console.error("Error saving changes", err);
			return;
		}
	});
}

function addInputListeners()
{
	document.querySelectorAll('input, textarea, select').forEach((el) => {
		const settingsPage = $('settings-page');
		if (!settingsPage) return;
		const element = el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
		element.addEventListener('change', (event) => {
			const name = element.name;
			const value = element.value;
			if (name === 'avatar')
			{
				avatar = sendAvatar();
				if (!avatar)
				{
					delete newUserData[name as keyof IUserData];
					return;
				}
				const upload_avatar = event.target as HTMLInputElement;
				const userAvatar = $('userAvatar') as HTMLImageElement;
				if (userAvatar && upload_avatar && upload_avatar.files)
					userAvatar.src = URL.createObjectURL(upload_avatar.files[0]); // to learn about it
			}
			if (value !== userData[name as keyof IUserData])
				newUserData[name as keyof IUserData] = value;
			else
				delete newUserData[name as keyof IUserData];
		});
	});
	SaveChanges();
}

function confirmPopUp(message: string) : Promise<boolean>
{
	return new Promise((resolve) => {
		const deletePopUp = document.createElement('div');
		deletePopUp.className = `h-screen absolute w-screen`;
		deletePopUp.innerHTML = `
			<div class="bg-[#1a1e22] top-1/2 left-1/2 absolute z-20 transform -translate-x-1/2
			-translate-y-1/2 rounded-2xl p-6 flex flex-col gap-4">
				<p class="font-bold text-txtColor">${message}</p>
				<button id="confirm-btn" class="bg-color1 hover:bg-orange-600  transition-all duration-200 hover:scale-[1.01] rounded-2xl p-2" id="confirm-delete">Yes</button>
				<button id="cancel-btn" class="bg-color1  hover:bg-orange-600 transition-all duration-200 hover:scale-[1.01] rounded-2xl p-2" id="cancel-delete">No</button>
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
	const deleteAvatarBtn = $('delete-avatar');
	if(!deleteAvatarBtn)
			return ;
	deleteAvatarBtn.addEventListener('click', async ()=> {
		const confirmed = await confirmPopUp('Are you sure you want to delete your avatar?');
		if (!confirmed) return;
		try
		{
			const response = await fetch(`api/user/${userData?.id}/image`, {
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

function sendAvatar() : FormData | null
{
	const uploadAvatar = $('upload-avatar') as HTMLInputElement;
	if(!uploadAvatar)
			return null;
	if (!uploadAvatar.files || uploadAvatar.files.length === 0) return null;
	const file = uploadAvatar.files[0];
	if (file.size > 2097152) {
		alert("Image is too large. Max size 2MB.");
		return null;
	}
	const formData = new FormData;
	formData.append("avatar", file); // to learn about it
	return formData;
}

function avatarSettings() : string
{
	return  /* html */ `
		<div class="avatar-settings px-10 py-6 rounded-2xl bg-color4 glow-effect flex-1 flex flex-col gap-6">
			<p class="text-color1 font-bold text-lg xl:text-2xl">Edit your avatar</p>
			<div class="flex gap-16">
				<div class="flex flex-col items-center gap-2">
					<img id="userAvatar" src="${getImageUrl(userData.avatar_url)}" class="
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
	return /* html */ `
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
	return /* html */ `
		<div class="avatar-settings px-10 py-6 rounded-2xl flex bg-color4 glow-effect flex-col flex-1 gap-6">
			<p class="text-color1 font-bold text-lg xl:text-2xl">Account Settings</p>
			<div class="settings-name flex flex-col gap-2">
				<p class="text-txtColor text-sm ">Alias</p>
				${input("Change Alias", 'text', userData?.username ?? "", "username")}
				<p class="text-txtColor text-sm ">Mail</p>
				${input("Change Mail", 'text', userData?.username ?? "", "")}
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
	return /* html */ `
		<input
		${userData.auth_provider !== 'local' ? 'disabled' : ''}
		value="${value}"
		type="${type}"
		name="${name}"
		placeholder="${placeholder}"
		class="${userData.auth_provider === 'local' ? 'bg-transparent'  : ''} border focus:outline-none focus:border-color1
		focus:border-[2px] text-txtColor w-full placeholder:text-sm border-color2 rounded-2xl p-3"
		>
	`
}

function security() : string
{
	return /* html */ `
		<div class="avatar-settings px-10 py-6 rounded-2xl flex bg-color4 glow-effect flex-col gap-6 flex-1">
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
	return /* html */ `
		<div class="avatar-settings px-10 py-6 rounded-2xl flex bg-color4 glow-effect flex-col gap-6 flex-1">
			<p class="text-color1 font-bold text-lg xl:text-2xl">Account</p>
			<div class="flex flex-col gap-4">
				<p class="2xl:w-[60%] w-full text-white">Permanently delete your account and all associated data. This action cannot be undone.</p>
				<button id="delete-account" class="bg-red-500 text-white w-full
				lg:w-[60%] 2xl:w-[40%] rounded-2xl py-4 px-4 mb-6 hover:bg-red-600">Delete Account</button>
			</div>
		</div>
	`
}

function cancelChanges()
{
	const cancelButton = $('cancel-changes');
	if (cancelButton) {
		cancelButton.addEventListener('click', () => {
			if (Object.keys(newUserData).length === 0)
				return;
			newUserData = {};
			renderSettings();
		});
	}
}

async function deleteAccount() : Promise<void>
{
	try {
		const response =  await fetch(`api/user/deleteAccount/${userData.id}`, {
			method: 'DELETE',
			headers: { "Authorization": `Bearer ${credentials.token}`},
		});
		if (response.ok) {
			localStorage.clear();
			navigate('/sign-up');
			alert('account deleted succ...');
		} else {
			console.error('failed to delete account');
			alert('failed to delete account');
		}
	} catch(error) {
		alert('failed in fetch to delete account');
		console.error(error);
	}
}

export async function renderSettings()
{
	await data.initDashboard(false);
	const dashContent = $('dashboard-content');
	if (dashContent)
		dashContent.innerHTML = /* html */`
		<div id="settings-page" class="sm:px-16 flex-1 flex flex-col gap-6">
			<div class=" flex flex-row justify-between">
				<h1 class="text-txtColor font-bold text-2xl 2xl:text-4xl">Settings</h1>
				<div class="flex gap-4">
				<button id="cancel-changes" class="h-[50px] w-[200px] xl:text-lg rounded-2xl font-bold text-txtColor
				border border-color1 text-sm  hover:scale-105">Cancel Changes</button>
				<button id="save-changes" class="h-[50px] w-[200px] xl:text-lg rounded-2xl font-bold
				text-black text-sm bg-color1 hover:scale-105">Save Changes</button>
				</div>
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
	$('delete-account')?.addEventListener('click', _=>{deleteAccount();})
	addInputListeners();
	cancelChanges();
}
