import { closeNotificationSocket } from "./NavBar";
import { cleanupGlobalChat } from "../chat/globalChat";
import { toastError} from "./toast";
import { logout } from "./profileMenu";

export interface ApiError {
	message: string;
	statusCode: number;
	isNetworkError: boolean;
}

function handleSessionExpired(): void {
	closeNotificationSocket();
	cleanupGlobalChat();
	localStorage.clear();
	logout();
}

export async function isUserAuthenticated(): Promise<boolean> {
	const id = localStorage.getItem('id');
	const token = localStorage.getItem('token');
	if (!id || !token) {
		console.warn('Missing credentials');
		return false;
	}
	try {
		const response = await fetch(`api/user/${id}/profile`, {
			headers: { "Authorization": `Bearer ${token}` },
		});
		if (response.status === 401 || response.status === 404) {
			handleSessionExpired();
			return false;
		}
		return response.ok;
	}
	catch(err) {
		console.error('Auth check failed:', err);
		toastError('Unable to verify session. Please try again.');
		return false;
	}
}

export async function parseApiError(response: Response): Promise<string> {
	try {
		const data = await response.json();
		return data.message || data.error || getDefaultErrorMessage(response.status);
	} catch {
		return getDefaultErrorMessage(response.status);
	}
}

function getDefaultErrorMessage(statusCode: number): string {
	const messages: Record<number, string> = {
		400: 'Invalid request. Please check your input.',
		401: 'Please log in to continue.',
		403: 'You don\'t have permission to perform this action.',
		404: 'The requested resource was not found.',
		409: 'This action conflicts with existing data.',
		422: 'Invalid data provided.',
		429: 'Too many requests. Please slow down.',
		500: 'Server error. Please try again later.',
		502: 'Server is temporarily unavailable.',
		503: 'Service unavailable. Please try again later.',
	};
	return messages[statusCode] || 'An unexpected error occurred.';
}

interface FetchOptions extends RequestInit {
	showErrorToast?: boolean;
	skipAuthRedirect?: boolean;
}

export async function apiFetch<T = unknown>(
	url: string,
	options: FetchOptions = {}
): Promise<{ data: T | null; error: ApiError | null; response: Response | null }> {
	const { showErrorToast = true, skipAuthRedirect = false, ...fetchOptions } = options;
	const headers = new Headers(fetchOptions.headers);

	if (!headers.has('Authorization')) {
		const token = localStorage.getItem('token');
		if (token)
			headers.set('Authorization', `Bearer ${token}`);
	}
	const isFormData = fetchOptions.body instanceof FormData;
	if (isFormData)
		headers.delete('Content-Type');
	try {
		const response = await fetch(url, { ...fetchOptions, headers });
		if (response.status === 401 && !skipAuthRedirect) {
			handleSessionExpired();
			return {
				data: null,
				error: { message: 'Session expired', statusCode: response.status, isNetworkError: false },
				response
			};
		}
		if (response.ok) {
			try {
				const data = await response.json() as T;
				return { data, error: null, response };
			} catch {
				return { data: null, error: null, response };
			}
		}
		const errorMessage = await parseApiError(response);
		const error: ApiError = {
			message: errorMessage,
			statusCode: response.status,
			isNetworkError: false
		};
		if (showErrorToast)
			toastError(errorMessage);
		return { data: null, error, response };

	} catch (err) {
		console.error('Network error:', err);
		const error: ApiError = {
			message: 'Unable to connect to the server. Please check your connection.',
			statusCode: 0,
			isNetworkError: true
		};
		if (showErrorToast)
			toastError(error.message);
		return { data: null, error, response: null };
	}
}

export function showErrorMessage(message: string, statusCode: number): void {
	const body = document.querySelector('body');
	if (!body) return;

	body.innerHTML = /* html */ `
	<div class="fixed inset-0 bg-bgColor flex items-center justify-center z-50">
		<div class="bg-color4 rounded-2xl p-8 w-[400px] border border-color1/30 text-center">
			<div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
				<svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
				</svg>
			</div>
			<h2 class="text-2xl font-bold mb-2 text-red-400">Error ${statusCode}</h2>
			<p class="mb-6 text-gray-300">${message}</p>
			<button onclick="window.location.reload()"
				class="bg-color1 hover:bg-color1/80 text-white font-bold py-2 px-6 rounded-xl transition-colors">
				Reload Page
			</button>
		</div>
	</div>
	`;
}
