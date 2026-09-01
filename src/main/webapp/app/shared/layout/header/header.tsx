import './header.scss';

import React, { useEffect, useRef } from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router';
import LoadingBar, { LoadingBarRef } from 'react-top-loading-bar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt, faSignInAlt, faBuilding } from '@fortawesome/free-solid-svg-icons';

import { useAppSelector } from 'app/config/store';
import { AdminMenu, EntitiesMenu } from '../menus';
import { getLoginUrl } from 'app/shared/util/url-utils';

export interface IHeaderProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
  ribbonEnv: string;
  isInProduction: boolean;
  isOpenAPIEnabled: boolean;
}

const Header = (props: IHeaderProps) => {
  const loadingBarRef = useRef<LoadingBarRef>(null);
  const loadingCount = useAppSelector(state => state.loadingBar.count);
  const account = useAppSelector(state => state.authentication.account);
  const navigate = useNavigate();
  const pageLocation = useLocation();

  useEffect(() => {
    if (loadingCount > 0) {
      loadingBarRef.current?.continuousStart();
    } else {
      loadingBarRef.current?.complete();
    }
  }, [loadingCount]);

  const handleSignIn = () => {
    navigate(getLoginUrl(), {
      state: { from: pageLocation },
    });
  };

  return (
    <header className="booking-header-wrapper" id="app-header">
      <LoadingBar ref={loadingBarRef} className="loading-bar" color="#FFB700" />

      {/* Top Navbar */}
      <div className="booking-top-bar">
        <Link to="/" className="booking-logo">
          <FontAwesomeIcon icon={faBuilding} style={{ color: '#FFB700' }} />
          <span>Grand Hotel Sri Lanka</span>
        </Link>

        <div className="booking-top-actions">
          <button className="currency-btn" title="Currency">
            LKR
          </button>

          {props.isAuthenticated ? (
            <div className="d-flex align-items-center gap-3">
              <span className="text-white fw-bold" style={{ fontSize: '14px' }}>
                <FontAwesomeIcon icon={faUser} className="me-2" />
                {account.login}
              </span>
              <Link to="/logout" className="signin-btn text-decoration-none border-0" style={{ padding: '8px 12px' }}>
                <FontAwesomeIcon icon={faSignOutAlt} className="me-1" /> Sign out
              </Link>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <button className="signin-btn" onClick={handleSignIn}>
                <FontAwesomeIcon icon={faSignInAlt} className="me-1" /> Register / Sign in
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Navbar for Authenticated Users (Pills) */}
      {props.isAuthenticated && (
        <div className="booking-subnav-bar">
          <Nav className="d-flex align-items-center auth-nav-menu">
            <Link to="/" className="nav-link">
              Home
            </Link>
            <Link to="/profile" className="nav-link">
              Profile
            </Link>
            {props.isAdmin && <EntitiesMenu />}
            {props.isAdmin && <AdminMenu showOpenAPI={props.isOpenAPIEnabled} />}
          </Nav>
        </div>
      )}
    </header>
  );
};

export default Header;
