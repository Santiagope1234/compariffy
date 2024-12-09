import React from "react";
import Header from "@/components/header";
import Main from "@/components/main";
import Footer from "@/components/footer";

function layout({ children }) {
  return (
    <div>
      <Header />
      <main className='h-auto min-h-screen w-auto flex flex-col justify-center items-center'>
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default layout;
