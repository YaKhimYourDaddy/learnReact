import React, { useRef } from "react";
import "./Residencies.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import data from "../../utils/slider.json";
import { sliderSettings } from "../../utils/common";

const Residencies = () => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  return (
    <section className="r-wrapper">
      <div className="r-container paddings innerWidth">
        <div className="r-head flexColStart">
          <span className="orangeText">Best Choices</span>
          <span className="primaryText">Popular Residencies</span>
        </div>

        <div className="r-buttons flexCenter">
          <button ref={prevRef}>&lt;</button>
          <button ref={nextRef}>&gt;</button>
        </div>

        <Swiper
          {...sliderSettings}
          modules={[Navigation]}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }}
        >
          {data.map((card, index) => (
            <SwiperSlide key={index}>
              <div className="r-card flexColStart">
                <img src={card.image} alt="house" />
                <span className="secondaryText r-price">
                  <span style={{ color: "orange" }}>$</span>
                  <span>{card.price}</span>
                </span>
                <span className="primaryText">{card.name}</span>
                <span className="secondaryText">{card.time}</span>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default Residencies;
