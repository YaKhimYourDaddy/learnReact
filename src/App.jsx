import React from "react";
import Nav from "./Navigation/Nav";
import Product from "./Product/Product";
import Sidebar from "./Sidebar/Sidebar";
import Recommended from "./Recommended/Recommended";
const App = () => {
  return (
    <>
      <Sidebar />
      <Nav />
      <Recommended />
      <Product />
    </>
  );
};

export default App;
