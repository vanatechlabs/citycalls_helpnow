import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HelpNowPage from "./helpnow/pages/HelpNowPage";
import DishWashingPage from "./helpnow/dishwashing";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HelpNowPage />} />
        <Route path="/help-now" element={<HelpNowPage />} />
        <Route path="/dish-washing" element={<DishWashingPage />} />
        <Route path="/help-now/dish-washing" element={<DishWashingPage />} />
        <Route path="/help-now/services/dish-washing" element={<DishWashingPage />} />
        <Route path="/services/dish-washing" element={<DishWashingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
