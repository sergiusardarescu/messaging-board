import React, { Component } from 'react';

import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import 'materialize-css/dist/css/materialize.min.css';

const App = ({ children }) => (
  <>
    <Header />

    <main className="container">
      {children}
    </main>

    <Footer />
  </>
);

export default App;
