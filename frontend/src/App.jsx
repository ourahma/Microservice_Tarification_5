import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import TarificationDetail from "./pages/TarificationDetail";
import TarificationsPage from "./pages/TarificationDetail.jsx";
import TarificationList from "./pages/TarificationList.jsx";

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/logout" element={<Login />} />
                    <Route path="/*" element={
                        <PrivateRoute roles={["ADMIN", "PRESTATAIRE", "CLIENT"]}>
                            <>
                                <Navbar />
                                <div className="pt-1">
                                    <Routes>
                                        <Route path="/" element={<Dashboard />} />
                                        <Route path="/tarifications" element={
                                            <PrivateRoute roles={["ADMIN", "PRESTATAIRE", "CLIENT"]}>
                                                <TarificationList />
                                            </PrivateRoute>
                                        } />
                                        <Route path="/tarification/:id" element={
                                            <PrivateRoute roles={["ADMIN", "PRESTATAIRE", "CLIENT"]}>
                                                <TarificationDetail />
                                            </PrivateRoute>
                                        } />
                                        <Route path="*" element={<Navigate to="/" />} />
                                    </Routes>
                                </div>
                            </>
                        </PrivateRoute>
                    } />
                </Routes>
            </div>
        </Router>
    );
}

export default App;