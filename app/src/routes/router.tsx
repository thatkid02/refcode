import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/HomePage";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import ReferralPage from "../pages/Dashboard/Referral/ReferralPage";
import NotFoundPage from "../pages/NotFound/NotFoundPage";
import ScorePage from "../pages/Dashboard/Score/ScorePage";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <HomePage />,
        errorElement: <NotFoundPage />,
    }
    ,
    {
        path: '/dash',
        element: <DashboardPage />,
        children: [
            {
                path: '/dash/score',
                element: <ScorePage />
            },
            {
                path: '/dash/referral',
                element: <ReferralPage />
            }
        ]
    }
]
);

