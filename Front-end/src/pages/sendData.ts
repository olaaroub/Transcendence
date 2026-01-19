import { renderAuthPage } from "./components/loginPage"
import { navigate } from "../router";

export async function sendAuthData(data: Record<string, string>, path:string) {
	const isSignup = (path === 'signUp');
	try
	{
		const response = await fetch("api/auth/" + path, {
			method: "POST",
			headers: {"Content-Type": "application/json",},
			body: JSON.stringify({
				username: data["alias or email"] || data["alias"] || "",
				password: data["password"],
				email: data["email"] || ""
			}),
		});
		const result = await response.json();
		if (result.success)
		{
			if (path == 'login')
			{
				localStorage.setItem("token", result.token);
				localStorage.setItem("id", result.id);
				navigate('/dashboard');
			}
			else
				navigate('/login');
		}
		else
			renderAuthPage(isSignup, result.error || "Authentication failed");
	}
	catch (error)
	{
		console.error("Error sending auth data:", error);
		renderAuthPage(isSignup, "Server unreachable. Please try again.");
	}
}
