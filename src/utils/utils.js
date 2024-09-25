import axios from 'axios';
import qs from 'qs';
import messages from './messages';
import {store} from '@/store';

export const message = messages;

export const delay = (time) => new Promise((res) => setTimeout(res, time));

export const retinaMediaQuery =
    '(-webkit-min-device-pixel-ratio: 1.5),\
    (min--moz-device-pixel-ratio: 1.5),\
    (-o-min-device-pixel-ratio: 3/2),\
    (min-resolution: 1.5dppx)';

const paramsSerializer = (params) => qs.stringify(params, {indices: false});

export const copyText = (text) => {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
    } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'absolute';
        textArea.style.left = '-999999px';
        textArea.style.zIndex = -1;

        document.body.prepend(textArea);
        textArea.select();

        try {
            document.execCommand('copy');
        } catch (e) {
        }
    }
};

export async function fetchData({url, method, data, params, auth = true, contentType, signal, responseType}) {
    if (!url) {
        return;
    }

    const headers = {};

    if (auth) {
        headers['accesstoken'] = `Bearer ${store.state?.user?.token}`
    }

    if (contentType) {
        headers['Content-Type'] = contentType;
    }

    return await axios({
        baseURL: import.meta.env.VITE_APP_API_URL,
        method,
        url,
        data,
        headers,
        signal,
        params,
        responseType,
        paramsSerializer
    });
}

export function numberWithSpaces(x) {
    const parts = x.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join(".");
}
