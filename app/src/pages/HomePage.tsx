import { useEffect, useState } from 'react'
import { useGoogleLogin } from '@react-oauth/google';
import './HomePage.css'
import TwitterLogin from '../components/twitter/Twitter';
import { useDispatch } from 'react-redux';
import { setTwitterSuccessToken } from '../state/Global/uxSlice';
import { redirect } from 'react-router-dom';
import GOOGLE_LOGO from '../assets/google.png';
import Toast from '../components/toast';
import { TwitterConfig } from '../components/twitter/config';

export default function HomePage() {
    const [error, setError] = useState<string>("");
    const [referredBy, setReferredBy] = useState<string>("");

    const dispatch = useDispatch()

    const emailId = sessionStorage.getItem("emailId");
    if (emailId) {
        window.location.href = '/dash'
    }

    useEffect(() => {
        const storedExpirationTime = sessionStorage.getItem('expirationTime');

        if (storedExpirationTime) {
            const expirationTime = parseInt(storedExpirationTime, 10);

            if (expirationTime < new Date().getTime()) {

                sessionStorage.clear();
            } else {
                const remainingTime = expirationTime - new Date().getTime();
                setTimeout(() => {
                    window.location.reload();
                }, remainingTime);
            }
        }
    }, []);

    const addCookie = (emailId: string) => {
        const expirationDate = new Date();
        expirationDate.setTime(expirationDate.getTime() + (1 * 60 * 60 * 1000));
        document.cookie = `emailId=${emailId}; expires=${expirationDate.toUTCString()}; path=/`;
    }

    useEffect(() => {
        initializeProcess();
    }, []);

    const initializeProcess = async () => {
        const [referralCode] =
            window.location.search.match(
                /^(?=.*ref=([^&]+)|).+$/
            ) || [];

        if (referralCode) {
            let refcode = referralCode.substring(5);
            const { message, referredUser, referredUserId } = await refferedUser(refcode);

            sessionStorage.setItem("refferedBy", referredUser);
            sessionStorage.setItem("refferedUserId", referredUserId);
            if (message && message != "Success") setError(message);
            setReferredBy(referredUser);
        }
    }

    const refferedUser = async (referralCode: string) => {
        return await fetch(TwitterConfig.refer_user_uri + referralCode, {
            method: "Get",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => data)
            .catch((error) => setError(error))
    }

    const authHandler = async (err: any, data: any) => {
        data && await data
        if (data?.oauth_token) {
            dispatch(setTwitterSuccessToken(data))

            await fetchTwitterUserDetails(data)

            // window.location.href = '/dash'
        }
        if (err) {
            console.log(err)
            redirect('/');
        }
    };

    const fetchTwitterUserDetails = async (data: any) => {
        if (data?.oauth_token) {
            const response = await fetch(TwitterConfig.verify_credentials_uri, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })
                .then((res) => res.json())
                .then((data) => data)
                .catch((error) => setError(error))

            if (response && response.emailId) {
                const { token, hasAccess, userName } = await fetchLoginToken(data, response)
                sessionStorage.setItem("expirationTime", (new Date().getTime() + 3600000).toString());
                sessionStorage.setItem("screenName", response.screenName)
                sessionStorage.setItem("emailId", response.emailId)
                sessionStorage.setItem("hasAccess", hasAccess)
                sessionStorage.setItem("token", token)
                sessionStorage.setItem("userName", userName)
                addCookie(response.emailId)

                window.location.href = '/dash'
            }
        }
    }

    const fetchLoginToken = async (data: any, response: { auth: any; screenName: any; emailId: any; }) => {
        return await fetch(TwitterConfig.refcode_login, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                provider: response.auth,
                providerUserId: response.screenName,
                email: response.emailId,
                provider_access_data: data
            }),
        })
            .then((response) => response.json())
            .then(data => data)
            .catch((error) => setError(error))
    }


    const [user, setUser] = useState<any>([]);

    console.log(user)

    const login = useGoogleLogin({
        onSuccess: (codeResponse) => setUser(codeResponse),
        onError: (error) => setError('Login Failed:' + error),
    })

    useEffect(
        () => {
            if (user && user.access_token) {
                fetchGoolgeUser()
            }
        },
        [user]
    );

    // const logOut = () => {
    //     googleLogout();
    //     setProfile(null);
    // };
    const fetchGoolgeUser = async () => {
        try {
            const res = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
                headers: {
                    Authorization: `Bearer ${user.access_token}`,
                    Accept: 'application/json'
                }
            })

            const data = await res.json()

            sessionStorage.setItem("emailId", data.email)
            const { token, hasAccess, userName } = await fetchLoginToken({ ...user }, { auth: "google", screenName: data.id, emailId: data.email })
            sessionStorage.setItem("expirationTime", (new Date().getTime() + 3600000).toString());
            sessionStorage.setItem("screenName", data.id)
            sessionStorage.setItem("hasAccess", hasAccess)
            sessionStorage.setItem("token", token)
            sessionStorage.setItem("userName", userName)
            addCookie(data.emailId)

            window.location.href = '/dash'
        } catch (error) {
            setError(error as string)
        }
    }


    return (
        <>
            <div className="flex flex-col justify-center items-center h-screen">
                <div className="bg-white p-6 rounded-lg shadow-md w-80 text-center bg-gradient-to-b from-amber-100 to-emerald-50">
                    <div className="text-4xl font-extrabold font-mono mb-4 bg-gradient-to-bl from-cyan-700 to-cyan-500 bg-clip-text text-transparent">ReF-Code</div>
                    {referredBy && <h3 className="font-mono mb-4 text-ellipsis">You have been invited by <br />
                        <code className='text-2xl font-extrabold bg-gradient-to-t from-cyan-400 to-violet-800 bg-clip-text text-transparent'>
                            {referredBy}
                        </code>. Proceed to Sign In
                    </h3>}
                </div>

                <div>
                    {error && <Toast message={error} />}
                </div>
                <div className="mt-6">
                    <div className="flex items-center justify-center">
                        <TwitterLogin authCallback={authHandler} isCompleted={false} className="rounded-full" />
                        <div className="mx-4"></div>
                        <button onClick={login as any} className="bg-gradient-to-r from-slate-300 to-slate-950 text-gray-100 font-semibold py-2 px-4 border rounded-full shadow-2xl ">
                            <div className="flex items-center">
                                <img src={GOOGLE_LOGO} alt="Google Logo" className="w-6 h-6 mr-2" />
                                Sign in with Google
                            </div>
                        </button>


                    </div>
                </div>
            </div>

        </>
    )
}
