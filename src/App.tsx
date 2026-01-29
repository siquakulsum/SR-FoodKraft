import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CustomerApp from '../Customer/src/App';
import AdminApp from '../Admin/src/App';
import './index.css';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/admin/*" element={<AdminApp />} />
                <Route path="/*" element={<CustomerApp />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
