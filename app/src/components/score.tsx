
export default function ScoreTable({ scores }: { scores: Array<{ username: string, reffereduserscount: number }> }) {
    const userName = sessionStorage.getItem('userName')
    return (<>
        {scores && scores.length > 0 && <div className="overflow-x-auto">
            <table className="table-auto min-w-full border-collapse border border-gray-200">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="px-4 py-2 text-left">Username</th>
                        <th className="px-4 py-2 text-left">Referred Users Count</th>
                    </tr>
                </thead>
                <tbody className="font-mono text-black">

                    {scores.map((score, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className={`px-4 py-2 ${score.username == userName ? "font-bold text-xl bg-gradient-to-tr from-slate-600 to-gray-400 text-white" : ""}`}>{score.username}</td>
                            <td className="px-4 py-2">{score.reffereduserscount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        }
    </>
    );
};

