type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
	duration?: number;
	position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const defaultOptions: ToastOptions = {
	duration: 3000,
	position: 'top-right'
};

function getPositionClasses(position: string): string {
	switch (position) {
		case 'top-left':
			return 'top-4 left-4';
		case 'top-center':
			return 'top-4 left-1/2 -translate-x-1/2';
		case 'bottom-right':
			return 'bottom-4 right-4';
		case 'bottom-left':
			return 'bottom-4 left-4';
		case 'bottom-center':
			return 'bottom-4 left-1/2 -translate-x-1/2';
		case 'top-right':
		default:
			return 'top-4 right-4';
	}
}

function getTypeStyles(type: ToastType): { bg: string; border: string; icon: string } {
	switch (type) {
		case 'success':
			return {
				bg: 'from-green-600/20 to-green-900/20',
				border: 'border-green-500/50',
				icon: `<svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
				</svg>`
			};
		case 'error':
			return {
				bg: 'from-red-600/20 to-red-900/20',
				border: 'border-red-500/50',
				icon: `<svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
				</svg>`
			};
		case 'warning':
			return {
				bg: 'from-yellow-600/20 to-yellow-900/20',
				border: 'border-yellow-500/50',
				icon: `<svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
				</svg>`
			};
		case 'info':
		default:
			return {
				bg: 'from-blue-600/20 to-blue-900/20',
				border: 'border-blue-500/50',
				icon: `<svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
				</svg>`
			};
	}
}

function ensureToastContainer(position: string): HTMLElement {
	const containerId = `toast-container-${position}`;
	let container = document.getElementById(containerId);
	
	if (!container) {
		container = document.createElement('div');
		container.id = containerId;
		container.className = `fixed ${getPositionClasses(position)} z-[9999] flex flex-col gap-2 pointer-events-none`;
		document.body.appendChild(container);
	}
	return container;
}

export function showToast(message: string, type: ToastType = 'info', options: ToastOptions = {}): void {
	const opts = { ...defaultOptions, ...options };
	const styles = getTypeStyles(type);
	const container = ensureToastContainer(opts.position!);
	
	const toast = document.createElement('div');
	toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl
		bg-gradient-to-r ${styles.bg} backdrop-blur-xl border ${styles.border}
		shadow-lg transform transition-all duration-300 ease-out
		translate-x-full opacity-0 min-w-[280px] max-w-[400px]`;
	
	toast.innerHTML = `
		<div class="flex-shrink-0 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center">
			${styles.icon}
		</div>
		<p class="text-txtColor text-sm flex-1">${message}</p>
		<button class="toast-close flex-shrink-0 text-gray-400 hover:text-white transition-colors p-1">
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
			</svg>
		</button>
	`;
	
	container.appendChild(toast);
	
	requestAnimationFrame(() => {
		toast.classList.remove('translate-x-full', 'opacity-0');
		toast.classList.add('translate-x-0', 'opacity-100');
	});
	const removeToast = () => {
		toast.classList.remove('translate-x-0', 'opacity-100');
		toast.classList.add('translate-x-full', 'opacity-0');
		setTimeout(() => {
			toast.remove();
			if (container.children.length === 0) {
				container.remove();
			}
		}, 300);
	};
	toast.querySelector('.toast-close')?.addEventListener('click', removeToast);
	if (opts.duration && opts.duration > 0) {
		setTimeout(removeToast, opts.duration);
	}
}
export function toastSuccess(message: string, options?: ToastOptions): void {
	showToast(message, 'success', options);
}
export function toastError(message: string, options?: ToastOptions): void {
	showToast(message, 'error', { duration: 5000, ...options });
}
export function toastWarning(message: string, options?: ToastOptions): void {
	showToast(message, 'warning', options);
}
export function toastInfo(message: string, options?: ToastOptions): void {
	showToast(message, 'info', options);
}
