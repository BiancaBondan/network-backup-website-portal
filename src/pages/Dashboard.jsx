// src/pages/Dashboard.jsx
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

export default function Dashboard() {
  return (
    <>
      <Header />

      <div className="dashboard-container">
        <div className="dashboard-body">
          <Sidebar />
          <main className="dashboard-content">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}
