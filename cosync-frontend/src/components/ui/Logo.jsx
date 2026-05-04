import React from 'react';

const Logo = ({ className = "w-8 h-8" }) => {
  return (
    <div className={`${className} flex items-center justify-center overflow-hidden flex-shrink-0`}>
      <img 
        src="/cosync_logo.jpeg" 
        alt="CoSync" 
        className="w-[160%] h-[160%] max-w-none object-cover"
        style={{
          // Converts colored logo on white bg -> solid white logo on transparent bg
          filter: "grayscale(1) contrast(300%) invert(1)",
          mixBlendMode: "screen"
        }}
      />
    </div>
  );
};

export default Logo;
