// src/components/ui/carousel.js
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Image from "next/image";

export function Carousel({ images }) {
  return (
    <Swiper spaceBetween={10} slidesPerView={1}>
      {images.map((image, index) => (
        <SwiperSlide key={index}>
          {/* Container com posição relativa e proporção definida */}
          <div className="relative w-full aspect-[16/10]">
            <Image
              src={image}
              alt="Ad Image"
              fill
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
