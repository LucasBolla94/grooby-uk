import React from 'react';
import Image from 'next/image';

const Logo = () => {
  return (
    <div className="p-4">
      <Image src="/logo.png" alt="Logo" width={150} height={50} />
    </div>
  );
};

export default Logo;
