import { useState } from 'react';
import { TwitterConfig } from './twitter/config';

export default function ClipboardCopy({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(TwitterConfig.referral_redirect_uri + text);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 1500);
    };

    return (
        <>
            <div className='flex justify-center'>

                <div className="relative bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl border-0 py-2 px-4 w-[650px] h-12">
                    <p className="text-gray-800 overflow-hidden whitespace-nowrap text-ellipsis rounded-2xl">{text}</p>

                </div>
                <button
                    className=" bg-green-500 hover:bg-green-700 text-white py-1 px-2 rounded"
                    onClick={copyToClipboard}
                >
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
        </>
    );
};

