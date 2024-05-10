import { useState, useEffect } from "react";
import TwitterLoginButton from "./TwitterButton";
import { openWindow, observeWindow } from "../window/window";
import { TwitterConfig } from "./config";

type TwitterLoginButtonTheme = "dark_short" | "light_short" | "dark" | "light";

interface TwitterLoginProps {
    authCallback?: (error?: any, result?: any) => void;
    callbackUrl?: string;
    buttonTheme?: TwitterLoginButtonTheme;
    className?: string;
    children?: React.ReactNode;
}

interface TwitterLoginState {
    isCompleted: boolean;
    popup?: Window;
}

export default function TwitterLogin(props: TwitterLoginProps & TwitterLoginState) {
    const [isCompleted, setIsCompleted] = useState(false);
    const [popup, setPopup] = useState<Window | undefined>(undefined);
    const getCookie = (name: string) => {
        const cookieValue = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
        return cookieValue ? cookieValue.pop() : '';
    };

    let cookieEmailId: string | undefined = getCookie('emailId')
    useEffect(() => {

        initializeProcess();
    }, []);

    const initializeProcess = () => {
        if (window.opener) {
            const [, oauthToken, oauthVerifier] =
                window.location.search.match(
                    /^(?=.*oauth_token=([^&]+)|)(?=.*oauth_verifier=([^&]+)|).+$/
                ) || [];
            window.opener.postMessage(
                {
                    type: "authorized",
                    data: {
                        oauthToken,
                        oauthVerifier,
                    },
                },
                window.origin
            );
            // Close the popup after posting message
            window.close();
        } else {
            window.addEventListener("message", handleMessageEvent, false);
        }
    };

    function handleMessageEvent({ data: { type, data } }: any) {
        if (type === "authorized") {
            handleAuthorizedMessage(data.oauthToken, data.oauthVerifier);
        }
    }
    const handleAuthorizedMessage = async (oauthToken: string, oauthVerifier: string) => {
        try {
            await fetchAccessToken(oauthToken, oauthVerifier)
                .then((resp) => resp.json())
                .then((data) => {
                    setIsCompleted(true);
                    props.authCallback && props.authCallback(undefined, data);
                    popup && popup.close();
                })

        } catch (error) {
            console.log("Failed to fetch access token", error)
        }
    };

    const fetchAccessToken = async (oauthToken: string, oauthVerifier: string) => {
        const accessTokenResp = await fetch(TwitterConfig.access_token_uri, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                oauth_token: oauthToken,
                oauth_verifier: oauthVerifier
            })
        });
        return accessTokenResp;
    };

    const handleLoginClick = async () => {
        const { callbackUrl } = props;
        const newPopup = openWindow({
            url: ``,
            name: "Log in with Twitter",
        });

        const resp = await fetch(TwitterConfig.request_token_uri, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                callbackUrl: callbackUrl,
            })
        });

        let requestTokenData = await resp.json() as unknown as {
            oauth_token: string;
            oauth_token_secret: string;
            oauth_callback_confirmed?: string;
        };

        if (requestTokenData.oauth_callback_confirmed == "true" && newPopup != undefined) {
            newPopup!.location.href = `https://api.twitter.com/oauth/${cookieEmailId ? "authenticate" : "authorize"}?oauth_token=${requestTokenData.oauth_token}`;
            newPopup && observeWindow({ popup: newPopup, onClose: handleClosingPopup });
            setPopup(newPopup);
        } else {
            handleError(
                `Callback URL "${window.location.href}" is not confirmed. Please check that is whitelisted within the Twitter app settings.`
            );
        }
    };

    const handleClosingPopup = async () => {
        const { authCallback } = props;
        if (!isCompleted) {
            authCallback && authCallback("User closed OAuth popup");
        }
        // Clear the popup state when it's closed
        setPopup(undefined);
    };

    const handleError = (message: string) => {
        const { authCallback } = props;
        authCallback && authCallback(message);
    };


    const { buttonTheme, className, children } = props;

    return children ? (
        <div onClick={handleLoginClick} className={className}>
            {children}
        </div>
    ) : (
        <TwitterLoginButton
            buttonTheme={buttonTheme || "dark"}
            buttonClassName={className}
            onClick={handleLoginClick}
        />
    );
};
