"use client";

import React, { Children } from "react";

function Main({ children }) {
  return <main className='h-auto min-h-screen w-auto'>{children}</main>;
}

export default Main;
