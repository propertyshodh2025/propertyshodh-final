import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add smooth scrolling configuration globally
document.documentElement.style.scrollBehavior = 'smooth';
document.body.style.overflowX = 'hidden';

createRoot(document.getElementById("root")!).render(<App />);
