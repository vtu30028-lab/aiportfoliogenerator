import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import PortfolioEditor from './pages/PortfolioEditor';
import JobAnalyzer from './pages/JobAnalyzer';
import PublicPortfolio from './pages/PublicPortfolio';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function Layout() {
  const location = useLocation();
  const isPublicPortfolio = location.pathname.startsWith('/portfolio/');

  return (
    <div className="flex flex-col min-h-screen">
      {!isPublicPortfolio && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/editor" element={<PortfolioEditor />} />
          <Route path="/job-analyzer" element={<JobAnalyzer />} />
          <Route path="/portfolio/:slug" element={<PublicPortfolio />} />
        </Routes>
      </main>
      {!isPublicPortfolio && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
