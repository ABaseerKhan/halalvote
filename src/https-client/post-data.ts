export const postData = async (url = '', data = {}) => {
    const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': '0idjsdWPR62EQoEPW8Wh46tw2TYNgpU36VLHGQpu',
        },
        body: JSON.stringify(data),
    });
    return await response.json();
}
