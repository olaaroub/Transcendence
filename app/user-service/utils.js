import createError from 'http-errors';

export async function changeItemInOtherService(url, newValue) {
    const response = await fetch(`${url}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newValue)
    });

    if (!response.ok) {
        throw createError.BadGateway("Failed to sync changes with Other Service");
    }
    // const responsAsJson = await response.json();

    // if (!responsAsJson.ok) {
    //     throw createError.BadGateway("Failed to sync changes with Other Service");
    // }
}