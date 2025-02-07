import React from 'react';  
import fbicon from "../assets/Fb.png";   
import instaicon from "../assets/insta.png";  
import logo from "../assets/LogoPawfrindu.png";  

const Footer = () => {   
  return (  
    <footer className="bg-[#D8B2B9] mt-10">  
      <div className="flex flex-wrap gap-16 justify-start section__container p-5">  
        <div className="flex-1 min-w-[200px] text-left footer__col">  
          <div className="footer__logo">  
            <img className="w-75 mt-5" src={logo} alt="Logo" />   
          </div>  
        </div>  

        <div className="flex-1 min-w-[200px] text-left footer__col">  
          <h4 className="mb-4 text-lg font-semibold text-[#333]">Company</h4>  
          <ul className="footer__links space-y-3">  
            <li><a className="font-medium text-[#333] hover:underline">Home</a></li>  
            <li><a className="font-medium text-[#333] hover:underline">About Us</a></li>  
            <li><a className="font-medium text-[#333] hover:underline">Adopt</a></li>  
            <li><a className="font-medium text-[#333] hover:underline">Lost/found</a></li>  
            <li><a className="font-medium text-[#333] hover:underline">Training</a></li>  
            <li><a className="font-medium text-[#333] hover:underline">Veterinary</a></li>  
          </ul>  
        </div>  

        <div className="flex-1 min-w-[200px] text-left footer__col">  
          <h4 className="mb-4 text-lg font-semibold text-[#333]">Address</h4>  
          <ul className="footer__links space-y-3">  
            <li><a className="font-medium text-[#333] hover:underline">Tunisia</a></li>  
            <li><a className="font-medium text-[#333] hover:underline">View on Maps</a></li>  
          </ul>  
          <br />  
          <h4 className="mb-4 text-lg font-semibold text-[#333]">Inquiries</h4>  
          <ul className="footer__links space-y-3">  
            <li><a className="font-medium text-[#333] hover:underline">+216</a></li>  
            <li><a className="font-medium text-[#333] hover:underline">info@website.com</a></li>  
          </ul>  
        </div>  

        <div className="flex-1 min-w-[200px] text-left footer__col">  
          <h4 className="mb-4 text-lg font-semibold text-[#333]">Newsletter</h4>  
          <p className="mb-4 text-[#333]">Stay updated with our latest news</p>  
          <form action="/" method="POST">  
            <input type="text" placeholder="Your email" className="p-2 w-full outline-none border-none text-[#333] bg-transparent" />  
           
          </form>  
          <br />  
          <h4 className="mb-4 text-lg font-semibold text-[#333]">Follow Us</h4>  
          <ul className="footer__socials flex items-center flex-wrap gap-2 list-none p-0 m-0">  
            <li>  
              <img className="w-7 h-7" src={fbicon} alt="Facebook" />   
            </li>  
            <li>  
              <a><img className="w-7 h-7" src={instaicon} alt="Instagram" /></a>  
            </li>  
          </ul>  
        </div>  
      </div>  
    </footer>  
  );  
};  

export default Footer;