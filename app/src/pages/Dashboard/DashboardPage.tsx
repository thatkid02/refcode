

import { useEffect, useState } from "react";
import { TwitterConfig } from "../../components/twitter/config";
import { useNavigate } from "react-router-dom";
import ReferralPage from "./Referral/ReferralPage";
import Toast from "../../components/toast";
import LogoutButton from "../../components/logout";
import ScoreTable from "../../components/score";


// interface EHT {
//     address?: string
//     Balance?: any
// }

interface EthWindow {
    ethereum?: any
}
export default function DashboardPage() {
    const [error, setError] = useState<string>("");
    const [scores, setScores] = useState<any>([]);
    let ehtWindow = window as Window & EthWindow
    // const [data, setdata] = useState<EHT>({
    //     address: "",
    //     Balance: null,
    // });
    const navigate = useNavigate();
    const emailId = sessionStorage.getItem("emailId");
    const [hasAccess, setHasAccess] = useState<string>("false");

    if (!emailId) window.location.href = '/'

    useEffect(() => {
        const hasAccessSession = sessionStorage.getItem("hasAccess");
        hasAccessSession && setHasAccess(hasAccessSession)
        if (hasAccess && hasAccess === "true") {
            navigate('/dash/referral')
        }
    }, [hasAccess])

    const getbalance = async (address: any) => {
        ehtWindow.ethereum
            .request({
                method: "eth_getBalance",
                params: [address, "latest"],
            })
            .then(async () => {
                // setdata({
                //     address: address,
                //     Balance: balance,
                // });
                const res = await addWallet(address)
                if (res && res.hasAccess) {
                    sessionStorage.setItem("hasAccess", hasAccess)
                    setHasAccess(hasAccess)
                }
            });
    };

    const addWallet = async (address: string) => {
        try {
            const res = await fetch(TwitterConfig.wallet_login_uri, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    emailId,
                    walletAddress: address,
                }),
            });

            if (res.status === 401) {
                setError("Please login again");
                sessionStorage.clear();
                window.location.reload();
            }

            const data = await res.json();
            return data as { hasAccess: string };
        } catch (error) {
            console.error("Error adding wallet:", error);
            setError("An error occurred while adding the wallet.");
        }
    };


    const accountChangeHandler = (account: any) => {
        // setdata({
        //     address: account,
        // });

        getbalance(account);
    };
    const btnhandler = () => {
        if (ehtWindow.ethereum) {
            ehtWindow.ethereum
                .request({ method: "eth_requestAccounts" })
                .then((res: any[]) =>
                    accountChangeHandler(res[0])
                );
        } else {
            alert("install metamask extension!!");
        }
    };

    const handleScoreClick = async () => {
        const scores = await fetchScores();
        if (scores && scores.length > 0) {
            setScores(scores)
            navigate('/dash/referral')
        }
    }
    const fetchScores = async () => {
        try {
            const res = await fetch(TwitterConfig.refer_score_uri, {
                method: "get",
                headers: {
                    "Authorization": `Bearer ${sessionStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
            })
            if (res.status === 401) {
                setError("Please login again");
                sessionStorage.clear();
                window.location.reload();
            }

            const data = await res.json();
            return data as { username: string, reffereduserscount: number }[]
        } catch (error) {
            setError(error as unknown as string)
        }
    }
    return (
        <div>
            <div className="absolute top-5 right-5">
                <LogoutButton />
            </div>
            {error && <Toast message={error} />}
            <div className="flex flex-col justify-center items-center h-screen">
                <div className="flex flex-col justify-center items-center">
                    <h1 className="text-3xl font-bold mb-4">Welcome {emailId}</h1>
                    <button onClick={handleScoreClick} className="border-cyan-600 border-2 text-2xl font-extrabold bg-gradient-to-t from-cyan-400 to-violet-800 bg-clip-text text-transparent  py-2 px-4 rounded-full focus:outline-none focus:shadow-outline">My Scores</button>
                    {hasAccess == 'true' &&
                        <div className="flex flex-col justify-center items-center mt-2">
                            <p className="text-lg mb-4 font-mono">You can generate referral link</p>
                            <ReferralPage />
                        </div>
                    }
                </div>
                {hasAccess == 'false' && <div className="bg-white p-6 rounded-lg shadow-md w-80 text-center">

                    <button
                        onClick={btnhandler}
                        className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline"
                    >
                        Connect to wallet
                    </button>
                </div>}
                {scores &&
                    <div className="mt-6">
                        <ScoreTable scores={scores} />
                    </div>
                }
            </div>
        </div>
    )
}