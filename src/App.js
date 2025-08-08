import React from "react";
import Navbar from "./components/navbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./components/pages/Home";
import MyDocuments from "./components/pages/MyDocuments";
import Upload from "./components/pages/Upload";
import SignUp from "./components/pages/SignUp";
import TermsOfService from "./components/pages/TermsOfService";
import PrivacyPolicy from "./components/pages/PrivacyPolicy";
import Faq from "./components/pages/Faq";
import FeedbackPage from "./components/pages/FeedbackPage";
import Profile from "./components/pages/Profile";
import SearchResults from "./components/SearchResults";
import ViewDocument from "./components/pages/ViewDocument";
import ProfilePage from "./components/pages/ProfilePage";
import Warnings from "./components/pages/Warnings";
import Suspended from "./components/pages/Suspended";
import VerifyOTP from "./components/pages/VerifyOTP";
import Inbox from "./components/pages/Inbox";
import Rewards from "./components/pages/Rewards";
import BroadcastMessage from "./components/pages/BroadcastMessage";
import AdminRoute from "./components/AdminRoute";
// import ViewBook from "./components/pages/ViewBook";
import ReaderPage from "./components/pages/ReaderPage";
import Contact from "./components/pages/Contact";
import About from "./components/pages/About";
import ForgotPassword from "./components/pages/ForgotPassword";
import ResetPassword from "./components/pages/ResetPassword";


// import MusicWidget from "./components/MusicWidget";

function App() {
  return (
    <Router>
      <Navbar />
      <ToastContainer position="top-center" autoClose={1500} />
      <Routes>
        <Route path="/" exact element={<Home />} />
        <Route path="/my-documents" element={<MyDocuments />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/document/:id" element={<ViewDocument />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path="/warnings" element={<Warnings />} />
        <Route path="/suspended" element={<Suspended />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/rewards" element={<Rewards />} />
        {/* <Route path="/book/:filename" element={<ViewBook />} /> */}
        <Route path="/reader/:filename" element={<ReaderPage />} />
        <Route
          path="/admin/broadcast"
          element={
            <AdminRoute>
              <BroadcastMessage />
            </AdminRoute>
          }
        />
      </Routes>
      {/* <MusicWidget/> */}
    </Router>
  );
}

export default App;
