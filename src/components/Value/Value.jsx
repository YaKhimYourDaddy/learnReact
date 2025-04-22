import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
  AccordionItemState,
} from "react-accessible-accordion";
import "react-accessible-accordion/dist/fancy-example.css";
import { MdOutlineArrowDropDown } from "react-icons/md";
import data from "../../utils/accordion.jsx";
import "./Value.css";
const Value = () => {
  return (
    <section className="v-wrapper">
      <div className="v-container paddings innerWidth flexCenter">
        <div className="v-left flexCenter">
          <div className="image-container">
            <img src="./value.png" alt="value" />
          </div>
        </div>
        <div className="v-right flexColStart">
          <span className="orangeText">Our Value</span>
          <span className="primaryText">Why Choose Us?</span>
          <span className="secondaryText">
            We always ready to help by providing the best services for you. We
            put our customers above all else.
          </span>
          <Accordion
            className="accordion"
            allowMultipleExpanded={false}
            preExpanded={[0]}
          >
            {data.map((item, index) => {
              const [className, setClassName] = React.useState("");
              return (
                <AccordionItem
                  className={`accordionItem ${className}`}
                  key={index}
                  uuid={index}
                >
                  <AccordionItemHeading>
                    <AccordionItemButton className="accordionButton flexCenter">
                      <AccordionItemState>
                        {({ expanded }) =>
                          expanded
                            ? setClassName("expaneded")
                            : setClassName("")
                        }
                      </AccordionItemState>
                      <div className="icon flexCenter">{item.icon}</div>
                      <span className="primaryText">{item.heading}</span>
                      <div className="icon flexCenter">
                        <MdOutlineArrowDropDown size={20} />
                      </div>
                    </AccordionItemButton>
                  </AccordionItemHeading>
                  <AccordionItemPanel>
                    <p>{item.detail}</p>
                  </AccordionItemPanel>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default Value;
