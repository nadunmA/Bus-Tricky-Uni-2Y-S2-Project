import React from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Outlet } from 'react-router-dom';
export function App() {
  return <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>;
}