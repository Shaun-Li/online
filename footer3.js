async function gk(keyBase64) {
    const byteArr = new TextEncoder().encode(keyBase64);
    const keyBuffer = byteArr.slice(0, 32);

    return crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-CBC' },
        true,
        ['encrypt', 'decrypt']
    );
}

async function cbc(key, ivStr, plaintext) {
    const byteArr = new TextEncoder().encode(ivStr);
    const iv = byteArr.slice(0, 16);

    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    try {
        const cipherBuffer = await crypto.subtle.encrypt({name: 'AES-CBC',iv: iv}, key, data);

        const cipherArr = new Uint8Array(cipherBuffer);
        let binary = '';
        for (let i = 0, len = cipherArr.length; i < len; i++) {
            binary += String.fromCharCode(cipherArr[i]);
        }
        return btoa(binary);

    } catch (error) {
        console.error('失败:', error.message);
        throw error;
    }
}
const apiUrl = 'https://master-data-admin-uat.test.lcscm.cn/master-api/userCp/getUserInfo';
window.a1 = '';
const reqFn = async () => {
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            throw new Error('HTTP error! Status: ' + response.status);
        }

        const responseData = await response.json();
        if (responseData.success && responseData.result && typeof responseData.result.userId !== 'undefined') {
            window.a1 = responseData.result.userId; 
        }
    } catch (error) {
        console.error('请求失败:', error.message);
    }
};

window.ed = async function (data) {
    try{
        if(!window.a1) {
            await reqFn();
        }
        const date = +new Date();

        const data1 = { currentDate: date+''+date };
        const data2 = Object.assign({}, data, {
            currentDate: date,
            a1: window.a1
        });

        const data1Str =JSON.stringify(data1);
        const data2Str =JSON.stringify(data2);

        const key = await gk(data1Str);

        const encrypt = await cbc(key, data1Str, data2Str);
        const e = await cbc(key, data1Str, encrypt);
        return Object.assign({}, data, {e, c1: date});
    } catch (error) {
        console.error('加密失败:', error.message);
        return data;
    } 
}
