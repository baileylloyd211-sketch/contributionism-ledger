import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Ledger from './components/Ledger';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Ledger />} />
      {/* add more routes later if needed */}
    </Routes>
  </BrowserRouter>
);
