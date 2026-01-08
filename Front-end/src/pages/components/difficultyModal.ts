import { navigate } from "../../router";

const $ = (id: string) => document.getElementById(id as string);

export function showDifficultyModal() {
	const modal = document.createElement('div');
	modal.id = 'difficulty-modal';
	modal.className = 'fixed inset-0 z-50 flex items-center justify-center animate-fade-in';

	modal.innerHTML = /* html */ `
		<div class="absolute inset-0 bg-black/70 backdrop-blur-sm" id="modal-backdrop"></div>

		<div class="animate-slide-up relative bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] rounded-3xl p-8 max-w-2xl w-[90%] border border-white/10 shadow-2xl">
			<button id="close-difficulty-modal" class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200">
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
				</svg>
			</button>
			<div class="text-center mb-8">
				<h2 class="text-3xl font-bold text-white mb-2">Select AI Difficulty</h2>
				<p class="text-gray-400">Choose your challenge level</p>
			</div>
			<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<button class="group relative bg-gradient-to-br from-green-500/20 to-green-600/10
				hover:from-green-500/30 hover:to-green-600/20 rounded-2xl p-6 border border-green-500/30
				hover:border-green-500/60 transition-all duration-300
				hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] active:-translate-y-0.5"
				data-difficulty="Easy">
					<div class="text-center">
						<h3 class="text-xl font-bold text-green-500 mb-1 capitalize">Easy</h3>
						<p class="text-sm text-gray-400">Perfect for beginners</p>
					</div>
				</button>
				<button class="group relative bg-gradient-to-br from-yellow-500/20 to-yellow-600/10
				hover:from-yellow-500/30 hover:to-yellow-600/20 rounded-2xl p-6 border border-yellow-500/30
				hover:border-yellow-500/60 transition-all duration-300
				hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] active:-translate-y-0.5"
				data-difficulty="Normal">
					<div class="text-center">
						<h3 class="text-xl font-bold text-yellow-500 mb-1 capitalize">Normal</h3>
						<p class="text-sm text-gray-400">Balanced challenge</p>
					</div>
				</button>
				<button class="group relative bg-gradient-to-br from-red-500/20 to-red-600/10
				hover:from-red-500/30 hover:to-red-600/20 rounded-2xl p-6 border border-red-500/30
				hover:border-red-500/60 transition-all duration-300
				hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] active:-translate-y-0.5"
				data-difficulty="Hard">
					<div class="text-center">
						<h3 class="text-xl font-bold text-red-500 mb-1 capitalize">Hard</h3>
						<p class="text-sm text-gray-400">For experienced players</p>
					</div>
				</button>
			</div>
		</div>
	`;
	document.body.appendChild(modal);

	const closeModal = () => {
		modal.classList.remove('animate-fade-in');
		modal.classList.add('animate-fade-out');
		setTimeout(() => modal.remove(), 300);
	};
	$('close-difficulty-modal')?.addEventListener('click', closeModal);
	$('modal-backdrop')?.addEventListener('click', closeModal);

	modal.querySelectorAll('[data-difficulty]').forEach(btn => {
		btn.addEventListener('click', (e) => {
			const difficulty = (e.currentTarget as HTMLElement).getAttribute('data-difficulty');
			console.log(`Selected difficulty: ${difficulty}`);
			closeModal();
			navigate(`/pong-game?mode=local-vs-ai&difficulty=${difficulty}`);
		});
	});
}
