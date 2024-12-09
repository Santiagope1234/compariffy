import React from "react";

export const metadata = {
  title: "Página Especial",
};

export default function LoginLayout({ children }) {
  return (
    <div className='bg-black items-center justify-center min-h-screen h-auto flex flex-col'>
      {children}
    </div>
  );
}
