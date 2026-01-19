import * as data from "./dashboard"
import { navigateBack } from "../router";
import { IUserData, userData, getImageUrl} from "./store"
import { toastSuccess, toastError, toastWarning, toastInfo } from "./components/toast";
import { closeNotificationSocket } from "./components/NavBar";
import { cleanupGlobalChat } from "./chat/globalChat";
import { apiFetch } from "./components/errorsHandler";
import { logout } from "./components/profileMenu";

const $ = (id : string) => document.getElementById(id as string);

let newUserData: Partial<IUserData> = {};
// const body: BodyInit | null = "";
// const headers : Record<string, string> = {
// 	"Authorization": `Bearer ${localStorage.getItem('token')}`
// }
let avatar : FormData | null = null;

async function checkPasswordChange() : Promise<boolean>
{
	const value = newUserData["new-password" as keyof IUserData];
	const currentPassword = newUserData["current-password" as keyof IUserData];
	const confirmPassword = newUserData["confirm-password" as keyof IUserData];
	if (!value && !currentPassword && !confirmPassword)
		return true;
	if (!currentPassword) {
		toastWarning('Current password is required to change the password.');
		return false;
	}
	if (!confirmPassword || value !== confirmPassword) {
		toastWarning('Invalid password confirmation.');
		return false;
	}
	const { error } = await apiFetch(`api/auth/${userData?.id}/settings-password`, {
		method: 'PUT',
		body: JSON.stringify({ currentPassword, newPassword: value }),
		headers: { "Content-Type": "application/json" },
		showErrorToast: false,
		skipAuthRedirect: true
	});
	if (error) {
		toastError('Current Password is Incorrect.');
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
				toastInfo('No changes to save.');
				return;
			}
			if (!await checkPasswordChange()) return;
			if (!await confirmPopUp('Do you want to apply these changes?')) return;

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
				let requestBody: BodyInit;
				let contentType: Record<string, string> = {};
				const tmp = String(value).trim();
				if (key === 'username' && (tmp.length < 1 || tmp.length > 30 || tmp === userData.username))
					return toastError("Invalid Alias!");
				if (key === 'bio' && tmp.length > 200)
					return toastError("Bio is too long! Max 200 characters.");
				if (key === 'avatar' && avatar) {
					requestBody = avatar;
				} else {
					requestBody = JSON.stringify({ [key]: value });
					contentType = { "Content-Type": "application/json" };
				}
				const { error } = await apiFetch(`api/user/${userData?.id}/settings-${key}`, {
					method: 'PUT',
					body: requestBody,
					headers: contentType,
					showErrorToast: false
				});
				if (error) {
					toastError(`Failed to update ${key}.`);
					return ;
				} else
					delete newUserData[key as keyof IUserData];
			}
			navigateBack();
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
					userAvatar.src = URL.createObjectURL(upload_avatar.files[0]);
			}
			if (value !== userData[name as keyof IUserData])
				newUserData[name as keyof IUserData] = value as any;
			
			else
				delete newUserData[name as keyof IUserData];
		});
	});
	SaveChanges();
}

export function confirmPopUp(message: string) : Promise<boolean>
{
	return new Promise((resolve) => {
		const deletePopUp = document.createElement('div');
		deletePopUp.className = `fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm`;
		deletePopUp.innerHTML = /* html */ `
			<div class="relative bg-gradient-to-br from-bgColor/95 to-black/90 backdrop-blur-xl
				rounded-3xl p-8 flex flex-col gap-6 w-[380px] border border-color1/30
				shadow-2xl transform transition-all duration-300"
				style="box-shadow: 0 0 40px rgba(237, 111, 48, 0.15);">
				<div class="flex justify-center">
					<div class="w-16 h-16 rounded-full bg-color1/20 flex items-center justify-center">
						<svg class="w-8 h-8 text-color1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
						</svg>
					</div>
				</div>
				<div class="text-center">
					<h3 class="text-xl font-bold text-txtColor mb-2">Confirm Action</h3>
					<p class="text-txtColor/70">${message}</p>
				</div>
				<div class="flex flex-col gap-3">
					<button id="confirm-btn" class="bg-gradient-to-r from-color1 to-color2
						rounded-xl py-3 px-6 font-bold text-bgColor
						transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-color1/30">
						Yes, Confirm
					</button>
					<button id="cancel-btn" class="bg-transparent border border-color3/50
						rounded-xl py-3 px-6 font-semibold text-txtColor/70
						transition-all duration-300 hover:border-txtColor hover:text-txtColor hover:bg-white/5">
						Cancel
					</button>
				</div>
			</div>
		`;
		document.body.appendChild(deletePopUp);
		deletePopUp.addEventListener('click', (e) => {
			if (e.target === deletePopUp) {
				deletePopUp.remove();
				resolve(false);
			}
		});
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
	const confirmed = await confirmPopUp('Are you sure you want to delete your avatar?');
	if (!confirmed) return;
	const { error } = await apiFetch<{message: string}>(`api/user/${userData?.id}/settings-avatar`, {
		method: 'DELETE',
	});
	if (!error) {
		toastSuccess('Avatar deleted successfully');
		renderSettings();
	}
}

function sendAvatar() : FormData | null
{
	const uploadAvatar = $('upload-avatar') as HTMLInputElement;
	if(!uploadAvatar)
			return null;
	if (!uploadAvatar.files || uploadAvatar.files.length === 0) return null;
	const file = uploadAvatar.files[0];

	const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
	const fileName = file.name.toLowerCase();
	const fileExtension = fileName.split('.').pop();
	if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
		toastWarning(`Invalid File Type! Allowed Formats: ${allowedExtensions.join(', ').toUpperCase()}`);
		uploadAvatar.value = '';
		return null;
	}

	const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
	if (!allowedMimeTypes.includes(file.type)) {
		toastWarning(`Invalid File Type! Please upload a Valid Image File.`);
		uploadAvatar.value = '';
		return null;
	}
	if (file.size > 2097152) {
		toastWarning("Image is too large! Max. Size: 2MB");
		uploadAvatar.value = '';
		return null;
	}
	const formData = new FormData;
	formData.append("avatar", file);
	return formData;
}

function avatarSettings() : string
{
	return  /* html */ `
		<div class="avatar-settings px-10 py-6 rounded-2xl bg-color4 glow-effect flex-1 flex flex-col gap-6">
			<h2 class="text-color1 font-bold text-lg xl:text-2xl">Your Avatar</h2>
			<div class="flex gap-10 xl:gap-16 md:flex-row flex-col items-center">
				<div class="flex flex-col items-center gap-2">
					<img id="userAvatar" src="${getImageUrl(userData.avatar_url)}" class="
					w-[130px] h-[130px] xl:w-[170px] xl:h-[170px] rounded-full border-2
					border-color1" alt="user" />
					<span class="text-sm text-color3">Max. Size: 2MB</span>
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

function accountSettings() : string
{
	return /* html */ `
		<div class="avatar-settings px-10 py-6 rounded-2xl flex bg-color4 glow-effect flex-col flex-1 gap-6">
			<h2 class="text-color1 font-bold text-lg xl:text-2xl">Personal Info</h2>
			<div class="settings-name flex flex-col gap-2">
				<p class="text-txtColor ">Alias</p>
				${input("Change Alias", 'text', userData?.username ?? "", "username")}
				<p class="text-txtColor ">Email</p>
				${input("Change Mail", 'text', userData?.email ?? "", "")}
			</div>
			<div class="settings-name flex flex-col gap-2 mb-6">
				<p class="text-txtColor">Your Bio</p>
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
	const flag : boolean = (userData.auth_provider !== 'local' || placeholder == "Change Mail")
	return /* html */ `
		<input
		${flag ? 'disabled' : ''}
		value="${value}"
		type="${type}"
		name="${name}"
		placeholder="${placeholder}"
		class="${flag ?  '' : 'bg-transparent'} border focus:outline-none focus:border-color1
		focus:border-[2px] text-txtColor w-full placeholder:text-sm border-color2 rounded-2xl p-3"
		>
	`
}

function security() : string
{
	return /* html */ `
		<div class="avatar-settings px-10 py-6 rounded-2xl flex bg-color4 glow-effect flex-col gap-6 flex-1">
			<h2 class=" text-color1 font-bold text-lg xl:text-2xl">Change Password</h2>
			<div class="flex flex-col gap-2">
				<div class="flex gap-6 flex-col 2xl:flex-row">
					${input("Current Password", "password", "", "current-password")}
					${input("New Password", "password", "", "new-password")}
					${input("Confirm Password", "password", "", "confirm-password")}
				</div>
			</div>
		</div>
	`
}

function Account() : string
{
	return /* html */ `
		<div class="avatar-settings px-10 py-6 rounded-2xl flex bg-color4 glow-effect flex-col gap-6 flex-1">
			<h2 class="text-color1 font-bold text-lg xl:text-2xl">Delete Account</h2>
			<div class="flex flex-row gap-4 ">
				<p class="w-full text-white">Permanently delete your account and all associated data.<br/>This action cannot be undone.</p>
				<button id="delete-account" class="bg-red-500 text-white w-full h-[60px]
				lg:w-[60%] 2xl:w-[40%] rounded-2xl py-4 px-4 mb-6 hover:bg-red-600">Delete Account
				</button>
			</div>
		</div>
	`
}

function cancelChanges()
{
	const cancelButton = $('cancel-changes');
	if (cancelButton) {
		cancelButton.addEventListener('click', () => {
			if (Object.keys(newUserData).length === 0) {
				toastInfo('No changes to cancel.');
				return;
			}
			newUserData = {};
			renderSettings();
		});
	}
}

async function deleteAccount() : Promise<void>
{
	const confirmed = await confirmPopUp('Are you sure you want to delete your account? This action CANNOT be undone!');
	if (!confirmed) return;
	const { error } = await apiFetch<{message: string}>(`api/user/deleteAccount/${userData.id}`, {
		method: 'DELETE',
	});
	if (!error) {
		closeNotificationSocket();
		cleanupGlobalChat();
		localStorage.clear();
		logout();
	} else
		toastError('Failed to delete account!');
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
				<button id="cancel-changes" class="h-[50px] xl:text-lg p-2 rounded-2xl font-bold text-txtColor
				border border-color1 text-sm  hover:scale-105">Cancel Changes</button>
				<button id="save-changes" class="h-[50px] xl:text-lg rounded-2xl font-bold
				text-black text-sm bg-color1 p-2 hover:scale-105">Save Changes</button>
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
	$("delete-avatar")?.addEventListener('click', _=> {deleteAvatar()});
	addInputListeners();
	cancelChanges();
}
