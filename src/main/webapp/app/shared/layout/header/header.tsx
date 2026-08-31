import './header.scss';

import React, { useEffect, useRef, useState } from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router';
import LoadingBar, { LoadingBarRef } from 'react-top-loading-bar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBed, faUser, faSignOutAlt, faSignInAlt, faBuilding } from '@fortawesome/free-solid-svg-icons';

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

  const [activeTab, setActiveTab] = useState('stays');

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
          <span style={{ fontSize: '11px', fontWeight: 'normal', opacity: 0.8, marginLeft: '6px' }}>HMS</span>
        </Link>

        <div className="booking-top-actions">
          <button className="currency-btn" title="Currency">
            LKR
          </button>

          {props.isAuthenticated ? (
            <div className="d-flex align-items-center gap-2">
              <span className="text-white fw-bold me-2" style={{ fontSize: '14px' }}>
                <FontAwesomeIcon icon={faUser} className="me-1" />
                {account.login}
              </span>
              <Nav className="d-inline-flex">
                <Link to="/profile" className="text-white text-decoration-none me-3 mt-2">
                  Profile
                </Link>
                {props.isAdmin && <EntitiesMenu />}
                {props.isAdmin && <AdminMenu showOpenAPI={props.isOpenAPIEnabled} />}
              </Nav>
              <Link to="/logout" className="signin-btn text-decoration-none">
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

      {/* Subnav Navigation Ribbon */}
      <div className="booking-subnav-bar">
        <button className={`booking-subnav-item ${activeTab === 'stays' ? 'active' : ''}`} onClick={() => setActiveTab('stays')}>
          <FontAwesomeIcon icon={faBed} />
          <span>Stays</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
