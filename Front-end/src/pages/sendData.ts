import { renderAuthPage } from "./components/loginPage"
import { navigate } from "../router";

export async function sendAuthData(data: Record<string, string>, path:string) {
	try 
	{
		const response = await fetch("http://127.0.0.1:3000/" + path, {
			method: "POST",
			headers: {"Content-Type": "application/json",},
			body: JSON.stringify(data),
		});

		// if (!response.ok && response.status != 401){throw new Error("Request failed");}

		const result = await response.json();
		console.log(result);
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
			renderAuthPage(false, "Oops, this password or email seems invalid");
	}
	catch (error)
	{
		console.error("Error sending auth data:", error);
	}
}