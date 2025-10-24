import { navigate } from "../router";

export async function renderAbout() {
	const cardsData = [

		{
			name: 'mmondad',
			role: 'Front-End',
			image: 'images/mmondad.jpeg',
			gradientFrom: '#ed6f30',
			gradientTo: '#d18a10',
		},
		{
			name: 'Ohammou-',
			role: 'Back-End',
			image: 'images/ohammou-.jpeg',
			gradientFrom: '#d18a10',
			gradientTo: '#ed6f30',
		},
		{
			name: 'hes-safi',
			role: 'Game Dev',
			image: 'images/hes-safi.jpeg',
			gradientFrom: '#878787',
			gradientTo: '#1B1A1DD6',
		},
		{
			name: 'oumondad',
			role: 'security',
			image: 'images/oumondad.jpeg',
			gradientFrom: '#ed6f30',
			gradientTo: '#878787',
		},
		{
			name: 'olaaroub',
			role: 'Devops',
			image: 'images/olaaroub.jpeg',
			gradientFrom: '#d18a10',
			gradientTo: '#1B1A1DD6',
		},
	]
	document.body.innerHTML = `

	<div class="w-full min-h-screen bg-[#1B1A1DD6] flex flex-col items-center pt-32">
		<img id="about-logo" class="cursor-pointer absolute top-10 left-3" src="images/logo.png" alt="Logo">
		<div class="flex flex-col items-center bg-color4/30 backdrop-blur-md px-24 py-9 rounded-3xl shadow-2xl">
			<h1 class="text-5xl font-extrabold text-white mb-4">About <span class="text-color1">Us</span></h1>
			<p class="text-[#878787] text-center max-w-xl mb-12 text-lg">
				We are a passionate team of developers, each specializing in different domains, working together to create amazing products.
			</p>

			<!-- Card Container -->
			<div class="w-full max-w-md bg-color1  p-1 rounded-xl">

				<div class="relative w-full h-[520px]">
					${cardsData.map((card, index) => `
						<div class="absolute inset-0 flex flex-col overflow-hidden rounded-xl shadow-2xl animate-slideCard anim-delay-${index * 5}s bg-gradient-to-b from-[${card.gradientFrom}]/90 to-[${card.gradientTo}]/70">
							<img class="block object-cover w-full h-[75%] rounded-t-xl" src="${card.image}" alt="">
							<div class="flex flex-col items-center justify-center h-[25%] gap-1">
								<p class="px-5 py-1 bg-white/20 text-white text-lg font-bold rounded-full shadow-md backdrop-blur-sm">
									${card.name}
								</p>
								<p class="text-white/90 text-sm font-medium">${card.role}</p>
							</div>
						</div>
					`).join('')}
				</div>
			</div>
		</div>
	</div>
	`;
	document.getElementById('about-logo')!.onclick = () => {
		navigate('/');
	};
}
