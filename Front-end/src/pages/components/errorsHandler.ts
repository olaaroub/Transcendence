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
        const response = await fetch(`api/user/${id}`, {
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

    body.innerHTML = /* html */ `
    <div class="fixed inset-0 bg-bgColor bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-96">
            <h2 class="text-xl font-bold mb-4 text-red-600">Error
            <span class="font-bold">${statusCode}</span></h2>
            <p class="mb-6 text-gray-700">${message}</p>
        </div>
    </div>
    `;
}
