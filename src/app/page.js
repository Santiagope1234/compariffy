"use client";

import Header from "@/components/header";
import Footer from "@/components/footer";
import Main from "@/components/main";
import { Input } from "@/components/ui/input";
import Cards from "@/components/cards";

export default function Home() {
  return (
    <>
      <Header />
      <Main className='h-auto min-h-screen w-auto'>
        <section className='flex bg-zinc-700 justify-center items-center flex-col min-h-72 h-auto gap-10'>
          <h1 className='text-white w-auto h-auto text-3xl'>
            Compare - The website where you compare everything
          </h1>
          <Input
            placeholder='Search products'
            className='bg-white rounded-sm w-[100px] px-2 py-1 lg:w-[700px] max-[769px]:w-[220px] placeholder:text-sm outline-none'
          />
        </section>
        <h2 className='text-2xl font-bold m-14'>Comparisons</h2>
        <Cards />
      </Main>
      <Footer />
    </>
  );
}
