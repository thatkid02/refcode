
const base_api_url = import.meta.env.REACT_APP_BASE_API_URL || "http://localhost:3018";
const base_app_url = import.meta.env.REACT_APP_URL || "http://localhost:5174";
export const TwitterConfig: { readonly [key: string]: string } = {
    consumer_key: import.meta.env.REACT_APP_CONSUMER_KEY || "",
    consumer_secret: import.meta.env.REACT_APP_CONSUMER_KEY_SECRET || "",
    request_token_uri: `${base_api_url}/auth/twitter`,
    verify_credentials_uri: `${base_api_url}/auth/twitter/verify`,
    refcode_login: `${base_api_url}/auth/login`,
    access_token_uri: `${base_api_url}/auth/twitter/accessToken`,
    wallet_login_uri: `${base_api_url}/auth/wallet`,
    get_referral_code_uri: `${base_api_url}/auth/myrefcode`,
    generate_referral_code_uri: `${base_api_url}/auth/referral/generate`,
    login_dialog_uri: 'https://api.twitter.com/oauth/authenticate',
    oauth_redirect_uri: 'http://localhost:3018/',
    refer_user_uri: `${base_api_url}/refcode?ref=`,
    refer_score_uri: `${base_api_url}/auth/score`,
    referral_redirect_uri: `${base_app_url}/?ref=`
};