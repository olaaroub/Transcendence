const $ = (id: string) => document.getElementById(id as string);

function renderDifficultyButton(difficulty: string, color: string, icon: string, description: string): string {
	return /* html */ `
		<button class="group relative bg-gradient-to-br from-${color}-500/20 to-${color}-600/10 
			hover:from-${color}-500/30 hover:to-${color}-600/20 rounded-2xl p-6 border border-${color}-500/30 
			hover:border-${color}-500/60 transition-all duration-300 
			hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] active:-translate-y-0.5" 
			data-difficulty="${difficulty}">
			<div class="flex flex-col items-center gap-4">
				<div class="w-16 h-16 rounded-full bg-${color}-500/20 group-hover:bg-${color}-500/30 
					flex items-center justify-center transition-all duration-300">
					<svg class="w-8 h-8 text-${color}-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						${icon}
					</svg>
				</div>
				<div class="text-center">
					<h3 class="text-xl font-bold text-${color}-500 mb-1 capitalize">${difficulty}</h3>
					<p class="text-sm text-gray-400">${description}</p>
				</div>
			</div>
		</button>
	`;
}

export function showDifficultyModal() {
	const modal = document.createElement('div');
	modal.id = 'difficulty-modal';
	modal.className = 'fixed inset-0 z-50 flex items-center justify-center animate-fade-in';
	
	const difficulties = [
		{
			level: 'easy',
			color: 'green',
			icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>',
			description: 'Perfect for beginners'
		},
		{
			level: 'normal',
			color: 'yellow',
			icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>',
			description: 'Balanced challenge'
		},
		{
			level: 'hard',
			color: 'red',
			icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"></path>',
			description: 'For experienced players'
		}
	];
	
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
				${difficulties.map(d => renderDifficultyButton(d.level, d.color, d.icon, d.description)).join('')}
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
			// TODO: Navigate to game with selected difficulty
			// navigate(`/game/local-ai?difficulty=${difficulty}`);
			closeModal();
		});
	});
}
