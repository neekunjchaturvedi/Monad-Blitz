import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { LandingPage } from "./Pages/Landing";
import { ExplorePage } from "./Pages/Explore";
import { AgentDetailPage } from "./Pages/AgentDetails";
import { DashboardPage } from "./Pages/Dashboard";
import { FeedPage } from "./Pages/Feed";
import { CreateAgentPage } from "./Pages/Create";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/agent/:id" element={<AgentDetailPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/create" element={<CreateAgentPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}
