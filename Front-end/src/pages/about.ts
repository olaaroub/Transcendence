import { navigate } from "../router";
import { getImageUrl } from "./store";

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
			role: 'Chat Dev',
			image: 'images/oumondad.jpeg',
			gradientFrom: '#ed6f30',
			gradientTo: '#878787',
		},
		{
			name: 'olaaroub',
			role: 'DevOps',
			image: 'images/olaaroub.jpeg',
			gradientFrom: '#d18a10',
			gradientTo: '#1B1A1DD6',
		},
	]
	document.body.innerHTML = /* html */`
	<div class="w-full min-h-screen bg-bgColor flex flex-col items-center py-16 px-6">
		<img id="about-logo" class="cursor-pointer xl:w-[150px] absolute top-8 left-16" src="${getImageUrl('images/logo.png')}" alt="Logo">
		<div class="w-full max-w-6xl translate-y-[50px]">
			<div class="bg-color1/45 backdrop-blur-md px-8 py-8 rounded-3xl shadow-2xl">
				<h1 class="text-4xl md:text-5xl font-extrabold text-txtColor mb-3 text-center">About <span class="text-color1">Us</span></h1>
				<p class="text-[#b1b1b1] max-w-3xl mb-12 text-md md:text-lg mx-auto text-center [text-wrap:balance]">
					We are a passionate team of developers, each specializing in different domains. Below are the teammates and their roles — click a card to learn more.
				</p>

				<div class="flex flex-wrap justify-center gap-10">
					${cardsData.map((card) => /* html */`
						<div class="w-full sm:w-[48%] lg:w-[30%]  transform hover:scale-[1.02] transition-all duration-200 cursor-pointer overflow-visible" onclick="void(0)">
							<div style="background: linear-gradient(135deg, ${card.gradientFrom}, ${card.gradientTo});" class="p-6 flex flex-col rounded-2xl shadow-lg items-center text-center">
								<div class="w-28 h-28 rounded-full overflow-hidden ring-4 ring-white -mt-12 shadow-md">
									<img src="${getImageUrl(card.image)}" alt="${card.name}" class="w-full h-full object-cover" />
								</div>
								<h3 class="mt-4 text-white text-xl font-bold">${card.name}</h3>
								<p class="text-white/90 text-sm mb-3">${card.role}</p>
								<p class="text-white/80 text-sm max-w-xs">A dedicated team member contributing to our shared project vision.</p>
							</div>
						</div>
					`).join('')}
				</div>
			</div>
		</div>
	</div>
	`;
	document.getElementById('about-logo')!.onclick = () => {navigate('/');};
}
