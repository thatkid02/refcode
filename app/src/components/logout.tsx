import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
    const [showModal, setShowModal] = useState(false);
    const nav = useNavigate();

    const handleLogout = () => {
        sessionStorage.clear();
        setShowModal(false);
        nav('/');
    };

    return (
        <>
            <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold font-mono py-2 px-4 rounded"
                onClick={() => setShowModal(true)}
            >
                Logout
            </button>

            {showModal && (
                <div id="modal" className="fixed z-50 inset-0 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-gray-900 opacity-50"
                        onClick={() => setShowModal(false)}
                    ></div>
                    <div className="bg-white rounded-lg shadow-lg p-6 z-10 modal">
                        <h2 className="text-xl font-bold mb-4">Confirm Logout</h2>
                        <p className="mb-6">Are you sure you want to log out?</p>
                        <div className="flex justify-end">
                            <button
                                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
};

export default LogoutButton;