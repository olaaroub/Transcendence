// A wrapper around the standard fetch
export async function apiFetch(url, options = {}) {
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, { ...options, headers });

        // 1. Handle Success
        if (response.ok) {
            // If it's a 204 No Content (Delete), return null
            if (response.status === 204) return null;
            return await response.json();
        }

        // 2. Handle Errors (Non-2xx status)
        const errorData = await response.json().catch(() => ({})); // Handle case where response isn't JSON (ModSecurity)
        const errorMessage = errorData.message || "An unexpected error occurred";

        switch (response.status) {
            case 400:
                showToast("error", errorMessage); // "Invalid Input"
                break;
            case 401:
                showToast("info", "Session expired");
                localStorage.removeItem('token');
                window.location.href = '/login';
                break;
            case 403:
                showToast("error", "Access Denied"); // Or ModSecurity Block
                break;
            case 404:
                // Let the component decide if it wants to redirect to a 404 page
                // or just show a toast. We throw the error so the component can catch it.
                throw { status: 404, message: errorMessage };
            case 409:
                showToast("warning", errorMessage); // "Username taken"
                break;
            case 500:
                showToast("error", "Server Error. Please try again.");
                break;
            default:
                showToast("error", errorMessage);
        }

        // Throw error to stop component logic from continuing
        throw { status: response.status, message: errorMessage };

    } catch (err) {
        // Handle network errors (offline)
        if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
             showToast("error", "Network Error. Check your connection.");
        }
        throw err; // Re-throw so specific components can handle custom logic if needed
    }
}

// Mock function for Toast - replace with your actual UI library (e.g., React-Toastify)
function showToast(type, msg) {
    console.log(`[${type.toUpperCase()}] ${msg}`);
    // Example: toast.error(msg);
}











export async function fetchProfile(userId: string | number | null) : Promise<IUserData | null> {
    if (!userId) {
        console.warn('User ID is null or undefined');
        return null;
    }
    let tmpUserData: IUserData | null = null;
    try {
        const response = await fetch(`/api/user/${userId}/profile`, {
            headers: { "Authorization": `Bearer ${credentials.token}` },
        });

        // [1] Handle 404 (Not Found)
        if (response.status === 404) {
            console.warn(`User ${userId} not found`);
            showErrorMessage("User not found", 404);
            return null;
        }

        // [2] Handle 401/403 (Auth Issues)
        if (response.status === 401 || response.status === 403) {
            localStorage.clear();
            navigate('/login');
            return null;
        }

        // [3] Handle 400 (Bad Request - e.g. Invalid ID format)
        if (response.status === 400) {
            console.error("Invalid user ID format");
            showErrorMessage("Invalid Request", 400);
            return null;
        }

        // [4] Handle 409 (Conflict - rare for GET, common for POST)
        if (response.status === 409) {
            showErrorMessage("Conflict: Resource state issue", 409);
            return null;
        }

        // [5] Handle Server Errors (500, 502, 503)
        if (!response.ok) {
            // Throw to catch block to handle generic network/server issues
            throw new Error(`HTTP Error: ${response.status}`);
        }

        // Success Path
        try {
            tmpUserData = await response.json();
            if (tmpUserData && userId == credentials.id)
                setUserData(tmpUserData);
        } catch (parseErr) {
            console.error('Invalid JSON from API:', parseErr);
            showErrorMessage('Unexpected server response.', 502);
            return null;
        }
    }
    catch (err) {
        console.error('Network error:', err);
        showErrorMessage('Server unreachable. Try again later.', 503);
    }
    return tmpUserData;
}
