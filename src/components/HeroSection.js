import { useEffect, useRef } from "react";
import "../App.css";
import "./HeroSection.css";
import { Link } from "react-router-dom";

function HeroSection() {
  const observerRef = useRef();

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const animatedElements = document.querySelectorAll(
      ".fade-in, .fade-in-left, .fade-in-right, .fade-in-up, .hero-subtitle-anim, .hero-buttons-anim, .hero-image-anim"
    );

    function animateCounter(element, target, duration = 2000) {
      let start = 0;
      const increment = target / (duration / 16);

      function updateCounter() {
        start += increment;
        if (start < target) {
          element.textContent = Math.floor(start).toLocaleString();
          requestAnimationFrame(updateCounter);
        } else {
          element.textContent = target.toLocaleString();
        }
      }
      updateCounter();
    }

    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const numberElement = entry.target.querySelector(".stats-number");
            const text = numberElement.textContent;

            if (text.includes("M+")) {
              const num = parseFloat(text) * 1000000;
              animateCounter(numberElement, num);
              numberElement.textContent = text;
            } else if (text.includes("%")) {
              const num = parseInt(text);
              let current = 0;
              const animate = () => {
                if (current < num) {
                  current++;
                  numberElement.textContent = current + "%";
                  setTimeout(animate, 30);
                }
              };
              animate();
            } else if (text.includes("+")) {
              const num = parseFloat(text) * 1000000;
              let current = 0;
              const animate = () => {
                if (current < num) {
                  current += num / 60;
                  numberElement.textContent =
                    (current / 1000000).toFixed(1) + "M+";
                  requestAnimationFrame(animate);
                } else {
                  numberElement.textContent = text;
                }
              };
              animate();
            }

            statsObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll(".stat-items").forEach((stat) => {
      statsObserver.observe(stat);
    });

    animatedElements.forEach((el) => {
      observerRef.current.observe(el);
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (statsObserver) {
        statsObserver.disconnect();
      }
    };
  }, []);

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title fade-in-up animate">
            Master Your Notes, Maximize Your Success
          </h1>
          <p className="hero-subtitle hero-subtitle-anim">
            Unlock learning through collaboration, not competition. Built for
            students who grow by sharing.
          </p>
          <div className="hero-buttons hero-buttons-anim">
            <Link to={"/sign-up"} className="btn-hero-primary">
              Get started for free
            </Link>
          </div>
          <div className="hero-image hero-image-anim">
            {/* <button className="hero-button">
              📊 Interactive Notewise Dashboard Preview
            </button> */}
          </div>
        </div>
      </section>
      {/* stats section  */}

      {/* <section class="stats-section">
        <div class="stats-content">
          <div class="stats-header fade-in">
            <h2>Trusted by knowledge workers worldwide</h2>
            <p>
              Join millions who have transformed their note-taking and knowledge
              management
            </p>
          </div>
          <div class="stats-grid">
            <div class="stat-items fade-in-scale stagger-1">
              <span class="stats-number">2M+</span>
              <span class="stat-label">Active users</span>
            </div>
            <div class="stat-items fade-in-scale stagger-2">
              <span class="stats-number">85%</span>
              <span class="stat-label">Report improved productivity</span>
            </div>
            <div class="stat-items fade-in-scale stagger-3">
              <span class="stats-number">50M+</span>
              <span class="stat-label">Notes created</span>
            </div>
            <div class="stat-items fade-in-scale stagger-4">
              <span class="stats-number">99.9%</span>
              <span class="stat-label">Uptime reliability</span>
            </div>
          </div>
        </div>
      </section> */}

      <section className="features-section" id="features">
        <div className="features-content">
          <div className="feature-block">
            <div className="feature-text fade-in-left">
              <h2>Share Your Academic Resources</h2>
              <p>
                Upload and organize your lecture notes, textbooks, and study
                materials in one secure platform. Build your academic library
                and access it anytime, from any device.
              </p>
              <ul className="feature-list">
                <li>Upload PDFs, slides, and handwritten notes in seconds</li>
                <li>Access your materials from laptop, tablet, or phone</li>
                <li>Categorize by course, subject, or semester</li>
              </ul>
            </div>
            <div className="feature-visual fade-in-right">
              <button className="hero-button">Upload Study Materials</button>
            </div>
          </div>
          <div className="feature-block">
            <div className="feature-text fade-in-right">
              <h2>Share High-Quality Notes, Get Rewarded</h2>
              <p>
                Keep our platform trustworthy with a system that rewards value
                and removes spam.
              </p>
              <ul className="feature-list">
                <li>
                  Documents with over 20 dislikes are removed, and the uploader
                  receives a warning
                </li>
                <li>Accounts with 3 warnings are removed from the platform</li>
                <li>
                  Each upload earns 1 point, redeemable for books and other
                  exclusive rewards
                </li>
                <li>
                  Upload 15 documents to unlock a personal notepad feature for
                  each submission
                </li>
              </ul>
            </div>
            <div className="feature-visual-two fade-in-left">
              <button className="hero-button">Explore Shared Resources</button>
            </div>
          </div>
          <div className="feature-block">
            <div className="feature-text fade-in-left">
              <h2>Find Exactly What You Need</h2>
              <p>
                Powerful search helps you instantly locate specific lecture
                notes, textbook sections, or study materials across all uploaded
                content.
              </p>
              <ul className="feature-list">
                <li>Search by course code or keywords</li>
                <li>Filter by document type, date, or popularity</li>
                <li>Save frequent searches for your core subjects</li>
              </ul>
            </div>
            <div className="feature-visual-three fade-in-right">
              <button className="hero-button">Search Academic Materials</button>
            </div>
          </div>
        </div>
      </section>
      {/* Reviews section  */}
      <section class="social-proof">
        <div class="social-proof-content">
          <h2 class="fade-in">From the Notewise community</h2>
          <div class="testimonials-grid">
            <div class="testimonial fade-in stagger-1">
              <p class="testimonial-text">
                "Notewise has completely transformed how our team collaborates.
                The organization features help us discover connections we never
                would have found on our own."
              </p>
              <div class="testimonial-author">
                <div class="author-avatar">S</div>
                <div class="author-info">
                  <h4>Sarah Johnson</h4>
                  <p>Product Manager at TechCorp</p>
                </div>
              </div>
            </div>
            <div class="testimonial fade-in stagger-2">
              <p class="testimonial-text">
                "As a researcher, I need to process vast amounts of information.
                Notewise's intelligent organization saves me hours every week."
              </p>
              <div class="testimonial-author">
                <div class="author-avatar">M</div>
                <div class="author-info">
                  <h4>Dr. Michael Chen</h4>
                  <p>Research Scientist</p>
                </div>
              </div>
            </div>
            <div class="testimonial fade-in stagger-3">
              <p class="testimonial-text">
                "The seamless integration with our existing tools made adoption
                effortless. Our productivity has increased by 40% since
                switching to Notewise."
              </p>
              <div class="testimonial-author">
                <div class="author-avatar">E</div>
                <div class="author-info">
                  <h4>Emily Rodriguez</h4>
                  <p>Operations Director</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="cta-section">
        <div className="cta-content fade-in">
          <h2>Take the next step toward better knowledge management</h2>
          <p>
            Join millions of users who have already transformed their workflow
            with Notewise. Start free today.
          </p>
          <Link
            to="/sign-up"
            className="btn-hero-primary"
            style={{ fontSize: "1.1rem", padding: "1.2rem 2.5rem" }}
          >
            Get started for free
          </Link>
        </div>
      </section>
    </>
  );
}

export default HeroSection;
