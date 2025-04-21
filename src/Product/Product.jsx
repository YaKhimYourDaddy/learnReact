import React from "react";
import "./Product.css";
import { AiFillStar, BsFillBagHeartFill } from "react-icons/ai";
const Product = () => {
  const obj = {
    img: "https://m.media-amazon.com/images/I/6125yAfsJKL._AC_UX575_.jpg",
    title: "Nike Air Monarch IV",
    star: <AiFillStar className="rating-star" />,
    reviews: "(123 reviews)",
    prevPrice: "$140,00",
    newPrice: "200",
    company: "Nike",
    color: "white",
    category: "sneakers",
  };
  return (
    <section className="card-container">
      <section className="card">
        <img src={obj.img} alt="shoe" />
        <div className="card-details">
          <h3 className="card-title">obj.title</h3>
          <section className="card-reviews">
            <AiFillStar />
            <AiFillStar />
            <AiFillStar />
            <AiFillStar />
            <span className="total-reviews">4</span>
          </section>
          <section className="card-price">
            <div className="price">
              <del>{obj.prevPrice}</del> {obj.newPrice}
            </div>
            <div className="bag">
              <BsFillBagHeartFill />
            </div>
          </section>
        </div>
      </section>
    </section>
  );
};

export default Product;
