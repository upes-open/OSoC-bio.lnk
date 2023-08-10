import React from "react";
import "./navbar.css";

const Navbar = () => {
	return (
		<div className='navbar-layout'>
			<a href='/' className='anchor-biolink'>
				bio.lnk
			</a>
			<div className='anchor tags'>
				<a href='/' className='navbar-anchor'>
					Home
				</a>
				<a href='/aboutus' className='navbar-anchor'>
					About Us
				</a>
				<a href='/login' className='navbar-anchor'>
					Login
				</a>
			</div>
		</div>
	);
};

export default Navbar;
