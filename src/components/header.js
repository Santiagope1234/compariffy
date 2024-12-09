"use client";

import React from "react";
import Image from "next/image";
import { useState } from "react";
import { IoMdSearch } from "react-icons/io";
import { CiLogin } from "react-icons/ci";
import Link from "next/link";
import { Input } from "./ui/input";

function Header() {
  const [isOpen, setIsOpen] = useState(false); // Estado para controlar el menú

  return (
    <header className='bg-black w-full h-auto flex items-center justify-center p-0 relative gap-36'>
      {/* Logo y navegación */}
      <div className='flex items-center gap-5'>
        {/* Logo */}
        <Link href={"/"}>
          <figure className='h-auto w-auto px-2'>
            <img
              width={150}
              src='https://elcomparatron.com/wp-content/uploads/2022/07/comparatron-logo.png'
            />
          </figure>
        </Link>

        {/* Formulario de búsqueda */}
        <form className='flex gap-3 justify-center w-auto h-auto lg:px-24'>
          <Input
            className='bg-white rounded-sm w-[100px] px-2 py-1 lg:w-[500px] max-[769px]:w-[120px] placeholder:text-sm outline-none'
            placeholder='Search products'
          />
          <button className='text-white'>{<IoMdSearch size={25} />}</button>
        </form>

        {/* Navegación en pantallas grandes */}
        <nav className='hidden sm:flex'>
          <ul className='flex gap-3 px-4 text-white items-center'>
            <Link href={"/electronics"}>
              <li>Electronics</li>
            </Link>
            <Link href={"/home-and-kitchen"}>
              <li>Home and Kitchen</li>
            </Link>
            <Link href={"/health-and-wellness"}>
              <li>Health</li>
            </Link>
            <Link href={"/fashion"}>
              <li>Fashion</li>
            </Link>
            <Link href='/login'>
              <CiLogin size={25} />
            </Link>
          </ul>
        </nav>

        {/* Menú hamburguesa */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className='text-white focus:outline-none sm:hidden ml-2'
          aria-label='Toggle navigation'
          aria-expanded={isOpen}>
          {/* Icono del menú hamburguesa */}
          {isOpen ? (
            // Icono de cerrar
            <svg className='h-6 w-6' viewBox='0 0 24 24'>
              <line
                x1='18'
                y1='6'
                x2='6'
                y2='18'
                stroke='currentColor'
                strokeWidth='2'
              />
              <line
                x1='6'
                y1='6'
                x2='18'
                y2='18'
                stroke='currentColor'
                strokeWidth='2'
              />
            </svg>
          ) : (
            // Icono de menú hamburguesa
            <svg className='h-6 w-6' viewBox='0 0 24 24'>
              <line
                x1='3'
                y1='6'
                x2='21'
                y2='6'
                stroke='currentColor'
                strokeWidth='2'
              />
              <line
                x1='3'
                y1='12'
                x2='21'
                y2='12'
                stroke='currentColor'
                strokeWidth='2'
              />
              <line
                x1='3'
                y1='18'
                x2='21'
                y2='18'
                stroke='currentColor'
                strokeWidth='2'
              />
            </svg>
          )}
        </button>
      </div>

      {/* Menú desplegable para móviles */}
      {isOpen && (
        <nav className='absolute top-full left-0 w-full bg-black sm:hidden'>
          <ul className='flex flex-col items-center gap-3 py-4 text-white'>
            <li>Tecnología</li>
            <li>Salud</li>
            <li>Cocina</li>
            <li>Belleza</li>
          </ul>
        </nav>
      )}
    </header>
  );
}

export default Header;
