// Api для шифрования ссылки подписи RSA-4096 Alt

import axios from "axios";

export async function cryptionLink(urlSub) {
    try {
        const { data } = await axios.post("https://crypto.happ.su/api.php", {
            url: urlSub
        });
        return data?.encrypted_link ?? null;
    } catch (e) {
        console.error(e);
        return null;
    }
    
}