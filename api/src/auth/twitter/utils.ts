import { HmacSHA1, enc } from "crypto-js";

export interface RequestTokenResponse {
    oauth_token: string;
    oauth_token_secret: string;
    oauth_callback_confirmed?: string;
}

const parseOAuthRequestToken = (responseText: string) =>
    responseText.split("&").reduce((prev, el) => {
        const [key, value] = el.split("=");
        return { ...prev, [key]: value };
    }, {} as RequestTokenResponse);

export const obtainOauthRequestToken = async ({
    consumerKey,
    consumerSecret,
    callbackUrl,
    method,
    apiUrl
}: {
    method: string;
    apiUrl: string;
    callbackUrl: string;
    consumerKey: string;
    consumerSecret: string;
}) => {
    try {

        const oauthSignature = requestTokenSignature({
            method,
            apiUrl,
            callbackUrl,
            consumerKey,
            consumerSecret
        });
        const res = await fetch(`${apiUrl}`, {
            method,
            headers: {
                Authorization: `OAuth ${oauthSignature}`
            }
        });
        const responseText = await res.text();
        return parseOAuthRequestToken(responseText);
    } catch (error) {
        console.log(error)
    }
};

export const obtainOauthAccessToken = async ({
    consumerKey,
    consumerSecret,
    oauthToken,
    oauthVerifier,
    method,
    apiUrl
}: {
    method: string;
    apiUrl: string;
    consumerKey: string;
    consumerSecret: string;
    oauthToken: string;
    oauthVerifier: string;
}) => {
    try {
        const oauthSignature = accessTokenSignature({
            method,
            apiUrl,
            consumerKey,
            consumerSecret,
            oauthToken,
            oauthVerifier
        });

        const res = await fetch(`${apiUrl}`, {
            method,
            headers: {
                Authorization: `OAuth ${oauthSignature}`
            }
        });
        const responseText = await res.text();
        return parseOAuthRequestToken(responseText);
    } catch (error) {
        console.log(error)
        return error
    }
};

export const requestTokenSignature = ({
    method,
    apiUrl,
    callbackUrl,
    consumerKey,
    consumerSecret
}: {
    method: string;
    apiUrl: string;
    callbackUrl: string;
    consumerKey: string;
    consumerSecret: string;
}) => {
    const params = {
        oauth_consumer_key: consumerKey,
        oauth_version: "1.0",
        oauth_signature_method: "HMAC-SHA1",
        oauth_callback: callbackUrl,
        oauth_timestamp: (Date.now() / 1000).toFixed(),
        oauth_nonce: Math.random()
            .toString(36)
            .replace(/[^a-z]/, "")
            .substr(2)
    };

    return makeSignature(params, method, apiUrl, consumerSecret);
};

export const accessTokenSignature = ({
    consumerKey,
    consumerSecret,
    oauthToken,
    oauthVerifier,
    method,
    apiUrl
}: {
    method: string;
    apiUrl: string;
    consumerKey: string;
    consumerSecret: string;
    oauthToken: string;
    oauthVerifier: string;
}) => {
    const params = {
        oauth_consumer_key: consumerKey,
        oauth_version: "1.0",
        oauth_signature_method: "HMAC-SHA1",
        oauth_token: oauthToken,
        oauth_verifier: oauthVerifier,
        oauth_timestamp: (Date.now() / 1000).toFixed(),
        oauth_nonce: Math.random()
            .toString(36)
            .replace(/[^a-z]/, "")
            .substr(2)
    };

    return makeSignature(params, method, apiUrl, consumerSecret);
};

export const makeSignature = (
    params: any,
    method: string,
    apiUrl: string,
    consumerSecret: string,
    tokenSecret?: string
) => {
    const paramsBaseString = Object.keys(params)
        .sort()
        .reduce((prev: string, el: any) => {
            return (prev += `&${el}=${params[el]}`);
        }, "")
        .substr(1);

    const signatureBaseString = `${method.toUpperCase()}&${encodeURIComponent(
        apiUrl
    )}&${encodeURIComponent(paramsBaseString)}`;

    let signingKey = `${encodeURIComponent(consumerSecret)}&`;
    if (tokenSecret) signingKey += `${encodeURIComponent(tokenSecret)}`

    const oauth_signature = enc.Base64.stringify(
        HmacSHA1(signatureBaseString, signingKey)
    );

    const paramsWithSignature = {
        ...params,
        oauth_signature: encodeURIComponent(oauth_signature)
    };

    return Object.keys(paramsWithSignature)
        .sort()
        .reduce((prev: string, el: any) => {
            return (prev += `,${el}="${paramsWithSignature[el]}"`);
        }, "")
        .substr(1);
};