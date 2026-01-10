import { navigate } from "../router";
import { renderNavBar } from "./components/NavBar";

const $ = (id: string) => document.getElementById(id as string);

export function renderPrivacy() {
	document.body.innerHTML = /* html */ `
		<div id="app" class="flex-grow w-[90%] max-w-5xl mx-auto min-h-screen">
			${renderNavBar(true)}
			
			<div class="content mx-auto py-8 sm:py-12">
				<div class="bg-gradient-to-br from-bgColor/95 to-black/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 md:p-10 border-2 border-color1/30 shadow-2xl">
					<h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-txtColor glow-stroke mb-6 sm:mb-8 text-center">
						Privacy Policy
					</h1>
					
					<div class="text-gray-300 space-y-6 leading-relaxed">
						<p class="text-sm text-gray-400 text-center mb-8">Last Updated: January 10, 2026</p>
						
						<section class="space-y-4">
							<p class="text-sm sm:text-base">
								At SPACE PONG ("we", "our", or "us"), we are committed to protecting your privacy. This Privacy Policy explains how 
								we collect, use, disclose, and safeguard your information when you use our gaming service.
							</p>
						</section>

						<section class="space-y-4">
							<h2 class="text-xl sm:text-2xl font-bold text-color2 mt-8 mb-4">1. Information We Collect</h2>
							
							<h3 class="text-lg sm:text-xl font-semibold text-color1 mt-6 mb-3">1.1 Personal Information</h3>
							<p class="text-sm sm:text-base">
								When you create an account, we may collect:
							</p>
							<ul class="list-disc list-inside space-y-2 ml-4 text-sm sm:text-base">
								<li>Username and display name</li>
								<li>Email address</li>
								<li>Profile picture/avatar</li>
								<li>Authentication information (when using third-party login services like 42 Intra, GitHub, or Google)</li>
								<li>Two-factor authentication settings</li>
							</ul>

							<h3 class="text-lg sm:text-xl font-semibold text-color1 mt-6 mb-3">1.2 Gameplay Information</h3>
							<p class="text-sm sm:text-base">
								We collect information related to your gameplay, including:
							</p>
							<ul class="list-disc list-inside space-y-2 ml-4 text-sm sm:text-base">
								<li>Game statistics and match history</li>
								<li>Leaderboard rankings</li>
								<li>Friends list and social connections</li>
								<li>Chat messages and communications</li>
								<li>In-game achievements and progress</li>
							</ul>

							<h3 class="text-lg sm:text-xl font-semibold text-color1 mt-6 mb-3">1.3 Technical Information</h3>
							<p class="text-sm sm:text-base">
								We automatically collect certain technical information:
							</p>
							<ul class="list-disc list-inside space-y-2 ml-4 text-sm sm:text-base">
								<li>IP address and device information</li>
								<li>Browser type and version</li>
								<li>Operating system</li>
								<li>Login timestamps and session data</li>
								<li>WebSocket connection data</li>
							</ul>
						</section>

						<section class="space-y-4">
							<h2 class="text-xl sm:text-2xl font-bold text-color2 mt-8 mb-4">2. How We Use Your Information</h2>
							<p class="text-sm sm:text-base">
								We use the collected information for:
							</p>
							<ul class="list-disc list-inside space-y-2 ml-4 text-sm sm:text-base">
								<li>Providing and maintaining the gaming service</li>
								<li>Managing your user account and authentication</li>
								<li>Tracking game statistics and leaderboards</li>
								<li>Enabling social features like friend requests and chat</li>
								<li>Sending notifications about friend activities and game updates</li>
								<li>Improving our service and user experience</li>
								<li>Detecting and preventing fraud or abuse</li>
								<li>Complying with legal obligations</li>
							</ul>
						</section>

						<section class="space-y-4">
							<h2 class="text-xl sm:text-2xl font-bold text-color2 mt-8 mb-4">3. Data Sharing and Disclosure</h2>
							<p class="text-sm sm:text-base">
								We do not sell your personal information. We may share your information in the following circumstances:
							</p>
							<ul class="list-disc list-inside space-y-2 ml-4 text-sm sm:text-base">
								<li><strong>Public Information:</strong> Your username, avatar, game statistics, and leaderboard position are visible to other users</li>
								<li><strong>Third-Party Authentication:</strong> When you use services like 42 Intra, GitHub, or Google for login, we receive limited information as per their privacy policies</li>
								<li><strong>Legal Requirements:</strong> When required by law or to protect our rights and users' safety</li>
								<li><strong>Service Providers:</strong> With trusted third-party service providers who assist in operating our service</li>
							</ul>
						</section>

						<section class="space-y-4">
							<h2 class="text-xl sm:text-2xl font-bold text-color2 mt-8 mb-4">4. Data Security</h2>
							<p class="text-sm sm:text-base">
								We implement appropriate security measures to protect your information:
							</p>
							<ul class="list-disc list-inside space-y-2 ml-4 text-sm sm:text-base">
								<li>Encrypted connections (HTTPS/WSS)</li>
								<li>Secure password hashing</li>
								<li>Two-factor authentication option</li>
								<li>Regular security audits</li>
								<li>Access controls and authentication tokens</li>
							</ul>
							<p class="text-sm sm:text-base mt-4">
								However, no method of transmission over the Internet is 100% secure. While we strive to protect your personal information, 
								we cannot guarantee its absolute security.
							</p>
						</section>

						<section class="space-y-4">
							<h2 class="text-xl sm:text-2xl font-bold text-color2 mt-8 mb-4">5. Cookies and Tracking Technologies</h2>
							<p class="text-sm sm:text-base">
								We use cookies and similar tracking technologies to:
							</p>
							<ul class="list-disc list-inside space-y-2 ml-4 text-sm sm:text-base">
								<li>Maintain your login session</li>
								<li>Remember your preferences</li>
								<li>Analyze usage patterns and improve our service</li>
								<li>Enable WebSocket connections for real-time features</li>
							</ul>
						</section>

						<section class="space-y-4">
							<h2 class="text-xl sm:text-2xl font-bold text-color2 mt-8 mb-4">6. Your Rights and Choices</h2>
							<p class="text-sm sm:text-base">
								You have the right to:
							</p>
							<ul class="list-disc list-inside space-y-2 ml-4 text-sm sm:text-base">
								<li>Access and review your personal information</li>
								<li>Update or correct your account information through settings</li>
								<li>Delete your account and associated data</li>
								<li>Control your privacy settings (e.g., online status visibility)</li>
								<li>Opt-out of non-essential notifications</li>
								<li>Request a copy of your data</li>
							</ul>
						</section>

						<section class="space-y-4">
							<h2 class="text-xl sm:text-2xl font-bold text-color2 mt-8 mb-4">7. Data Retention</h2>
							<p class="text-sm sm:text-base">
								We retain your information for as long as your account is active or as needed to provide you services. 
								If you delete your account, we will delete or anonymize your personal information, except where we are required 
								to retain it for legal or legitimate business purposes.
							</p>
						</section>

						<section class="space-y-4">
							<h2 class="text-xl sm:text-2xl font-bold text-color2 mt-8 mb-4">8. Children's Privacy</h2>
							<p class="text-sm sm:text-base">
								Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information 
								from children under 13. If you become aware that a child has provided us with personal information, please contact us.
							</p>
						</section>

						<section class="space-y-4">
							<h2 class="text-xl sm:text-2xl font-bold text-color2 mt-8 mb-4">9. International Data Transfers</h2>
							<p class="text-sm sm:text-base">
								Your information may be transferred to and maintained on servers located outside of your state, province, country, 
								or other governmental jurisdiction where data protection laws may differ. By using our Service, you consent to this transfer.
							</p>
						</section>

						<section class="space-y-4">
							<h2 class="text-xl sm:text-2xl font-bold text-color2 mt-8 mb-4">10. Changes to This Privacy Policy</h2>
							<p class="text-sm sm:text-base">
								We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy 
								on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
							</p>
						</section>

						<section class="space-y-4">
							<h2 class="text-xl sm:text-2xl font-bold text-color2 mt-8 mb-4">11. Contact Us</h2>
							<p class="text-sm sm:text-base">
								If you have any questions about this Privacy Policy or our data practices, please contact us through our support channels.
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
				<button id="terms-link" class="text-color2 hover:text-color1 transition-colors text-xs sm:text-sm underline">Terms of Service</button>
				<button id="about-us" class="py-2 px-4 sm:px-6 border text-color2 border-color2 rounded-lg transition-all opacity-70 duration-500 hover:bg-color2 hover:text-black font-bold text-sm sm:text-base">About Us</button>
			</div>
		</footer>
	`;

	$('back-btn')!.addEventListener('click', () => {navigate("/")});
	$('navBar-logo')!.addEventListener('click', () => {navigate("/")});
	$('about-us')!.addEventListener('click', () => {navigate("/about")});
	$('terms-link')!.addEventListener('click', () => {navigate("/terms")});
}
