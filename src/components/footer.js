import React from "react";
import Link from "next/link";

function Footer() {
  return (
    <footer className='bg-black text-white p-4 h-auto w-auto'>
      <ul>
        <Link href='/privacy-policy'>
          <li>Privacy policy</li>
        </Link>
        <Link href='/cookies-policy'>
          <li>Cookies policy</li>
        </Link>
        <Link href='/legal-notice'>
          <li>Legal notice</li>
        </Link>
        <Link href='/contact'>
          <li>Contact</li>
        </Link>
      </ul>
    </footer>
  );
}

export default Footer;
