import Header from "@/components/header";
import Footer from "@/components/footer";
import Main from "@/components/main";
import React from "react";

function layout({ children }) {
  return (
    <>
      <Header />
      <Main>{children}</Main>
      <Footer />
    </>
  );
}
export default layout;
