import os

files = {
    'frontend/src/App.jsx': '''import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
''',
    'frontend/src/main.jsx': '''import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
''',
    'frontend/src/components/Navbar.jsx': '''import { Link } from 'react-router-dom';

export default function Navbar() {
    return (
        <nav className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between">
                <Link to="/" className="text-xl font-bold">AI Portfolio</Link>
                <div className="space-x-4">
                    <Link to="/dashboard" className="hover:text-gray-300">Dashboard</Link>
                    <Link to="/login" className="hover:text-gray-300">Login</Link>
                </div>
            </div>
        </nav>
    );
}
''',
    'frontend/src/components/Footer.jsx': '''export default function Footer() {
    return (
        <footer className="bg-gray-800 text-white p-4 text-center mt-auto">
            <p>&copy; {new Date().getFullYear()} AI Portfolio Generator</p>
        </footer>
    );
}
''',
    'frontend/src/pages/Home.jsx': '''export default function Home() {
    return (
        <div className="container mx-auto p-8 text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to AI Portfolio Generator</h1>
            <p className="text-xl text-gray-600 mb-8">Generate a professional portfolio from your resume using AI.</p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">Get Started</button>
        </div>
    );
}
''',
    'frontend/src/pages/Dashboard.jsx': '''export default function Dashboard() {
    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
            <p>Welcome to your dashboard. Upload a resume to create a new portfolio.</p>
        </div>
    );
}
'''
}

for filepath, content in files.items():
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
