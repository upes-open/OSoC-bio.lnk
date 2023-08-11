import React from "react";
import "./hero.css";
import hero from "./images/hero.png";

const Hero = () => {
	return (
		<div className='hero'>
			<div className='hero-section1'>
				<p className='hero-text'>Do more with links</p>
				<p className='hero-text'>&</p>
				<p className='hero-text stand-out'>STAND OUT</p>
				<div className='buttons'>
					<button className='login'> LOGIN</button>
					<button className='signup'> SIGNUP</button>
				</div>
			</div>
			<div className='hero-section2'>
				<img src={hero} alt='hero-img' className='hero-image' />
			</div>
		</div>
	);
};

export default Hero;
