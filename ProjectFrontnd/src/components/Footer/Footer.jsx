import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="ftr">
      <div className="ftr__wrap">
        <div className="ftr__top">
          <div className="ftr__brand">
            <Link to="/" className="ftr__brandLink">
              <div className="ftr__logo">🏡</div>
              <div>
                <h3 className="ftr__name">Home Planner</h3>
                <p className="ftr__tag">Luxury home plan generator using AI</p>
              </div>
            </Link>
          </div>

          <div className="ftr__cols">
            <div className="ftr__col">
              <h4 className="ftr__title">Resources</h4>
              <Link className="ftr__link" to="/">Home</Link>
              <Link className="ftr__link" to="/about">About</Link>
            </div>

            <div className="ftr__col">
              <h4 className="ftr__title">Follow</h4>
              <a
                className="ftr__link"
                href="https://github.com/abhiramv83"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
              <Link className="ftr__link" to="/">Discord</Link>
            </div>

            <div className="ftr__col">
              <h4 className="ftr__title">Legal</h4>
              <Link className="ftr__link" to="#">Privacy Policy</Link>
              <Link className="ftr__link" to="#">Terms &amp; Conditions</Link>
            </div>
          </div>
        </div>


        <div className="ftr__line" />
        <div className="ftr__bottom">
          <p className="ftr__copy">
            © {new Date().getFullYear()} Home Planner. All Rights Reserved.
          </p>

          <div className="ftr__icons">
            <a className="ftr__icon" href="#" aria-label="Facebook">
              f
            </a>
            <a className="ftr__icon" href="#" aria-label="Discord">
              d
            </a>
            <a className="ftr__icon" href="#" aria-label="Twitter">
              t
            </a>
            <a className="ftr__icon" href="https://github.com/abhiramv83" target="_blank" rel="noreferrer" aria-label="GitHub">
              g
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
