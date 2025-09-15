// App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import LoginPage from "./pages/Login";
import SidebarLayout from "./components/SidebarLayout";
import ProductsPage from "./pages/Products";

import Account from "./pages/Account";
import Orders from "./pages/Orders";
// import Payments from "./pages/Payments";
// import Wishlist from "./pages/Wishlist";

function App() {
  return (
    <>
      <Navbar />
      <div className="pt-20 px-4">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Sidebar routes */}
          <Route element={<SidebarLayout />}>
            <Route path="/account" element={<Account />} />
            <Route path="orders" element={<Orders />} />
            {/* // <Route path="payments" element={<Payments />} />
            // <Route path="wishlist" element={<Wishlist />} />  */}
          </Route>
          <Route path="/products" element={<ProductsPage />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
