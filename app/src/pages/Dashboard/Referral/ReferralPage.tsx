import { useEffect, useState } from "react";
import ClipboardCopy from "../../../components/clipboard";
import { TwitterConfig } from "../../../components/twitter/config";
import Toast from "../../../components/toast";

export default function ReferralPage() {
    const [refcode, setRefcode] = useState<string>("");
    const [error, setError] = useState<string>("");
    const emailId = sessionStorage.getItem("emailId");

    useEffect(() => {
        const fetchReferralCode = async (emailId: string) => {
            try {
                const response = await getReferralCode(emailId);
                if (response && response.refCode) {
                    setRefcode(response.refCode);
                }
                if (response && response.message && response.message !== "Success") {
                    setError(response.message);
                }
            } catch (error) {
                console.error("Error fetching referral code:", error);
            }
        };

        if (emailId) {
            fetchReferralCode(emailId);
        }
    }, [emailId]);

    const handleGenRefcode = async () => {
        if (emailId) {
            try {
                const res = await generateReferralCode(emailId);
                if (res && res.refCode) {
                    setRefcode(res.refCode);
                }
                if (res && res.message && res.message !== "Success") {
                    setError(res.message);
                }
            } catch (error) {
                console.error("Error generating referral code:", error);
            }
        }
    };

    const getReferralCode = async (emailId: string) => {
        try {
            const res = await fetch(TwitterConfig.get_referral_code_uri, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ emailId }),
            });

            if (res.status === 401) {
                setError("Please login again");
                sessionStorage.clear();
                window.location.reload();
            }

            return await res.json();
        } catch (error) {
            console.log(error);
        }
    };

    const generateReferralCode = async (emailId: string) => {
        try {
            const res = await fetch(TwitterConfig.generate_referral_code_uri, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ emailId }),
            });

            if (res.status === 401) {
                setError("Please login again");
                sessionStorage.clear();
                window.location.reload();
            }

            return await res.json();
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="flex flex-col justify-center">
            <div>
                {error && <Toast message={error} />}
            </div>
            {refcode && <ClipboardCopy text={refcode} />}
            <button
                onClick={handleGenRefcode}
                className="w-[150px] self-center mt-10 text-white font-mono bg-slate-600 hover:bg-slate-800 focus:ring-4 focus:ring-blue-300 font-semibold text-2xl rounded-lg px-5 py-2.5 mr-2 mb-2"
            >
                Generate
            </button>
        </div>
    );
}