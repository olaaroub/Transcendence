import { navigate } from "../../router";


export async function isUserAuthenticated(): Promise<boolean> {
    const id = localStorage.getItem('id');
    const token = localStorage.getItem('token');
    if (!id || !token) {
        console.warn('Missing credentials');
        return false;
    }
    try
    {
        const response = await fetch(`http://127.0.0.1:3000/users/${id}`, {
            headers: { "Authorization": `Bearer ${token}` },
        });
        if (response.status === 401 || response.status === 403) {
            localStorage.clear();
            navigate('/login');
            return false;
        }
        return true;
    }
    catch(err) {console.log('error in server side');}
    return false;
}

export function showErrorMessage(message: string, statusCode: number) : void
{
    const body = document.querySelector('body');
    if (!body) return;

    body.innerHTML = `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-96">
            <h2 class="text-xl font-bold mb-4 text-red-600">Error
            <span class="font-bold">${statusCode}</span></h2>
            <p class="mb-6 text-gray-700">${message}</p>
            <button id="go-home" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">go-home</button>
        </div>
    </div>
    `;

    const closeButton = document.getElementById('go-home');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            navigate('/');
        });
    }
}
