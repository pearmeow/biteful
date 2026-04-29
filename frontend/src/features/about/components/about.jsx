import React from "react";
import "./About.css";
import logo from "../../../assets/biteful_logo.png"; 

const About = () => {
  return (
    <div className="about-page-wrapper">
      {/*  BITEFUL + logo to the right */}
      <header className="about-hero-header">
        <div className="hero-title-row">
          <h1 className="hero-brand-name">BITEFUL</h1>
          <img src={logo} alt="Biteful Logo" className="hero-logo" />
        </div>
        <p className="hero-slogan">FIND FOOD AND BE HAPPY!</p>
      </header>
    <div className="about-content-container">
      {/* vision section */}
      <section className="about-card vision-card">
        <div className="about-card-header">
          <span className="about-badge">THE VISION</span>
        </div>
        <div className="about-content">
          <p>
            Finding food in the area is something that many people struggle with, especially food that is affordable, accessible, 
            and healthy. Additionally, food insecurity remains a huge issue, yet information regarding food pantries is scarce. 
            Current solutions mostly address one of these issues, which makes users need multiple apps.
          </p>
          <p>
            <strong>Biteful addresses all these needs.</strong> The objective of Biteful is to create a platform that simplifies 
            food discovery and encourages eating healthier, while increasing visibility of food pantry resources. It will provide 
            a consolidated map-based platform for location restaurants and food pantries and a list of food items that allow 
            users to sort by price, distance, and healthiness.
          </p>
          <p>
            The project follows an incremental and iterative development life cycle. Our priority remains core functionality—interactive 
            mapping and sorting—while gamification features like avatar feedback are implemented as the platform stabilizes. 
            By integrating these features with food pantries, we aim to increase awareness and accessibility of vital community resources.
          </p>
        </div>
      </section>

      {/* team + contact session */}
      <div className="about-bottom-row">
        
        <section className="about-card team-section">
          <div className="about-card-header">
            <span className="about-badge">OUR TEAM</span>
          </div>
          <div className="about-content">
            <p>
              We are a team of four developers completing our year-long <strong>Senior Design Capstone (CS-UY 4523)</strong> at NYU, 
              under the guidance of <strong>Professor Strauss</strong>. This is our year-long project for this class. 
              We used Agile methods and worked together by splitting up working and always have each other check over our work.
            </p>
            <div className="about-team-grid">
              {['Jason Lin', 'Perry Huang', 'Angel Mejia', 'Remi Uy'].map((name) => (
                <div key={name} className="team-mini-box">
                  <div className="team-icon">👤</div>
                  <strong>{name}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="about-card contact-section">
          <div className="about-card-header">
            <span className="about-badge">CONTACT US</span>
          </div>
          <div className="about-content contact-details">
            <p>Questions or feedback about the platform? Reach out to us below:</p>
            <div className="contact-item">
              <strong>Email:</strong> <span>Biteful@thisdoesntexist.com</span>
            </div>
            <div className="contact-item">
              <strong>Phone:</strong> <span>(XXX)-XXX-XXXX</span>
            </div>
            <div className="contact-item">
              <strong>Deployment:</strong> <span>Web-based</span>
            </div>
          </div>
        </section>
              </div>
      </div>
    </div>
  );
};

export default About;