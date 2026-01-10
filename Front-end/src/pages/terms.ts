import { navigate } from "../router";
import { renderNavBar } from "./components/NavBar";

const $ = (id: string) => document.getElementById(id as string);

export function renderTerms() {
	document.body.innerHTML = /* html */ `
		<div id="app" class="flex-grow w-[90%] max-w-5xl mx-auto min-h-screen">
			${renderNavBar(true)}
			
			<div class="content mx-auto py-8 sm:py-12">
				<div class="bg-gradient-to-br from-bgColor/95 to-black/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 md:p-10 border-2 border-color1/30 shadow-2xl">
					<h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-txtColor glow-stroke mb-6 sm:mb-8 text-center">
						Terms of Service
					</h1>
					
					<div class="text-gray-300 space-y-6 leading-relaxed">
						<p class="text-sm text-gray-400 text-center mb-8">Last Updated: January 10, 2026</p>
						
						<section class="space-y-4">
							<h2 class="text-xl sm:text-2xl font-bold text-color2 mt-8 mb-4">1. Acceptance of Terms</h2>
							<p class="text-sm sm:text-base">
								By accessing and using SPACE PONG ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. 
								If you do not agree to these terms, please do not use the Service.
							</p>
						</section>

						<section class="space-y-4">
							<h2 class="text-xl sm:text-2xl font-bold text-color2 mt-8 mb-4">2. Use License</h2>
							<p class="text-sm sm:text-base">
								Permission is granted to temporarily access the materials (information or software) on SPACE PONG for personal, 
								non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
							</p>
							<ul class="list-disc list-inside space-y-2 ml-4 text-sm sm:text-base">
								<li>Modify or copy the materials</li>
								<li>Use the materials for any commercial purpose or for any public display</li>
								<li>Attempt to decompile or reverse engineer any software contained on the Service</li>
								<li>Remove any copyright or other proprietary notations from the materials</li>
								<li>Transfer the materials to another person or "mirror" the materials on any other server</li>
							</ul>
						</section>

						<section class="space-y-4">
							<h2 class="text-xl sm:text-2xl font-bold text-color2 mt-8 mb-4">3. User Accounts</h2>
							<p class="text-sm sm:text-base">
								When you create an account with us, you must provide accurate, complete, and current information at all times. 
								Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
							</p>
							<p class="text-sm sm:text-base">
								You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
							</p>
						</section>

						<section class="space-y-4">
							<h2 class="text-xl sm:text-2xl font-bold text-color2 mt-8 mb-4">4. User Conduct</h2>
							<p class="text-sm sm:text-base">
								You agree not to engage in any of the following prohibited activities:
							</p>
							<ul class="list-disc list-inside space-y-2 ml-4 text-sm sm:text-base">
								<li>Harassing, abusing, or harming another person</li>
								<li>Using the Service for any illegal or unauthorized purpose</li>
								<li>Interfering with or disrupting the Service or servers or networks connected to the Service</li>
								<li>Attempting to impersonate another user or person</li>
								<li>Using any robot, spider, or other automatic device to access the Service</li>
							</ul>
						</section>

						<section class="space-y-4">
							<h2 class="text-xl sm:text-2xl font-bold text-color2 mt-8 mb-4">5. Game Rules and Fair Play</h2>
							<p class="text-sm sm:text-base">
								All players must adhere to fair play principles. Any form of cheating, exploitation of bugs, or use of third-party 
								software to gain an unfair advantage is strictly prohibited and may result in account suspension or termination.
							</p>
						</section>

						<section class="space-y-4">
							<h2 class="text-xl sm:text-2xl font-bold text-color2 mt-8 mb-4">6. Intellectual Property</h2>
							<p class="text-sm sm:text-base">
								The Service and its original content, features, and functionality are and will remain the exclusive property of SPACE PONG 
								and its licensors. The Service is protected by copyright, trademark, and other laws.
							</p>
						</section>

						<section class="space-y-4">
							<h2 class="text-xl sm:text-2xl font-bold text-color2 mt-8 mb-4">7. Termination</h2>
							<p class="text-sm sm:text-base">
								We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, 
								including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
							</p>
						</section>

						<section class="space-y-4">
							<h2 class="text-xl sm:text-2xl font-bold text-color2 mt-8 mb-4">8. Limitation of Liability</h2>
							<p class="text-sm sm:text-base">
								In no event shall SPACE PONG, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any 
								indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, 
								goodwill, or other intangible losses.
							</p>
						</section>

						<section class="space-y-4">
							<h2 class="text-xl sm:text-2xl font-bold text-color2 mt-8 mb-4">9. Changes to Terms</h2>
							<p class="text-sm sm:text-base">
								We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of 
								any changes by posting the new Terms on this page and updating the "Last Updated" date.
							</p>
						</section>

						<section class="space-y-4">
							<h2 class="text-xl sm:text-2xl font-bold text-color2 mt-8 mb-4">10. Contact Us</h2>
							<p class="text-sm sm:text-base">
								If you have any questions about these Terms, please contact us through our support channels.
							</p>
						</section>
					</div>

					<div class="mt-10 flex justify-center">
						<button id="back-btn" class="bg-gradient-to-r from-color1 to-color2 rounded-2xl py-3 px-8 font-bold text-lg text-bgColor
							transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-color1/30 active:scale-[0.98]">
							Back to Home
						</button>
					</div>
				</div>
			</div>
		</div>

		<footer id="footer" class="w-[90%] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 py-8 text-white border-t border-slate-500 mt-auto">
			<p class="text-[#878787] text-sm sm:text-base">© 2025 SPACE PONG</p>
			<div class="flex flex-wrap justify-center gap-3 sm:gap-4">
				<button id="privacy-link" class="text-color2 hover:text-color1 transition-colors text-xs sm:text-sm underline">Privacy Policy</button>
				<button id="about-us" class="py-2 px-4 sm:px-6 border text-color2 border-color2 rounded-lg transition-all opacity-70 duration-500 hover:bg-color2 hover:text-black font-bold text-sm sm:text-base">About Us</button>
			</div>
		</footer>
	`;

	$('back-btn')!.addEventListener('click', () => {navigate("/")});
	$('navBar-logo')!.addEventListener('click', () => {navigate("/")});
	$('about-us')!.addEventListener('click', () => {navigate("/about")});
	$('privacy-link')!.addEventListener('click', () => {navigate("/privacy")});
}
