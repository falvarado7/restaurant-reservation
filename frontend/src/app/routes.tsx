import { Route, Routes, Navigate } from "react-router-dom";
import Layout from "./Layout";
import DashboardPage from "../features/reservations/views/DashboardPage";
import NewReservationPage from "../features/reservations/views/NewReservationPage";
import EditReservationPage from "../features/reservations/views/EditReservationPage";
import SeatReservationPage from "../features/reservations/views/SeatReservationPage";
import SearchPage from "../features/reservations/views/SearchPage";
import NewTablePage from "../features/tables/views/NewTablePage";

export default function AppRoutes() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/reservations/new" element={<NewReservationPage />} />
                <Route path="/reservations/:reservation_id/edit" element={<EditReservationPage />} />
                <Route path="/reservations/:reservation_id/seat" element={<SeatReservationPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/tables/new" element={<NewTablePage />} />
            </Route>
        </Routes>
    );
}