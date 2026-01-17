import { Link, NavLink } from "react-router-dom";
import "./Header.css";

export default function Header() {
  return (
    <header className="hdr">
      <nav className="hdr__nav">
        <div className="hdr__wrap">
          {/* Logo */}
          <Link to="/" className="hdr__brand">
            <div className="hdr__logo">🏡</div>
            <span className="hdr__name">Home Planner</span>
          </Link>

          {/* Links */}
          <ul className="hdr__links">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? "hdr__link hdr__link--active" : "hdr__link"
                }
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="https://abhiramv83.github.io/portfolio/"
                className={({ isActive }) =>
                  isActive ? "hdr__link hdr__link--active" : "hdr__link"
                }
              >
                Developer
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}