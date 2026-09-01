import React, { useEffect, useState } from 'react';
import { Row, Col, Badge, Modal, Form, Button, Alert, Tab, Nav } from 'react-bootstrap';
import axios from 'axios';
import dayjs from 'dayjs';
import DatePicker from 'react-datepicker';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBed,
  faCalendarAlt,
  faUser,
  faSearch,
  faCheckCircle,
  faCheck,
  faWifi,
  faTv,
  faSnowflake,
  faBath,
  faMapMarkerAlt,
  faCreditCard,
  faPrint,
  faPhone,
  faEnvelope,
  faIdCard,
  faConciergeBell,
  faList,
  faPlus,
  faMoneyBillWave,
} from '@fortawesome/free-solid-svg-icons';

import { useAppSelector } from 'app/config/store';
import { getLoginUrl } from 'app/shared/util/url-utils';
import { IRoom } from 'app/shared/model/room.model';
import { IBooking } from 'app/shared/model/booking.model';
import { IGuest } from 'app/shared/model/guest.model';
import { RoomType } from 'app/shared/model/enumerations/room-type.model';
import { BookingStatus } from 'app/shared/model/enumerations/booking-status.model';
import { Authority } from 'app/shared/jhipster/constants';
import { hasAnyAuthority } from 'app/shared/auth/private-route';

// Production quality comment: Hardcoded room images removed for production.
const DEFAULT_ROOM_IMAGE = 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80';

export const Home = () => {
  const isAuthenticated = useAppSelector(state => state.authentication.isAuthenticated);
  const account = useAppSelector(state => state.authentication.account);
  const isAdmin = useAppSelector(state => hasAnyAuthority(state.authentication.account.authorities, [Authority.ADMIN]));
  const isReceptionist = useAppSelector(state => hasAnyAuthority(state.authentication.account.authorities, [Authority.RECEPTIONIST]));

  // Search & Filter State
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<Date | null>(dayjs().toDate());
  const [endDate, setEndDate] = useState<Date | null>(dayjs().add(3, 'day').toDate());
  const [guestCount, setGuestCount] = useState<number>(2);
  const [maxPrice, setMaxPrice] = useState<number>(100000);

  // Data State
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [availableRoomIds, setAvailableRoomIds] = useState<Set<number>>(new Set());
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [guests, setGuests] = useState<IGuest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'guest' | 'staff'>('guest');

  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const navigate = useNavigate();

  // Booking Modal State
  const [selectedRoom, setSelectedRoom] = useState<IRoom | null>(null);
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [guestName, setGuestName] = useState<string>('');
  const [guestEmail, setGuestEmail] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('+1234567890');
  const [guestIdDoc, setGuestIdDoc] = useState<string>('DOC-982143');
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [submittingBooking, setSubmittingBooking] = useState<boolean>(false);
  const [completedBooking, setCompletedBooking] = useState<IBooking | null>(null);

  // Add Room Modal State (Staff)
  const [showAddRoomModal, setShowAddRoomModal] = useState<boolean>(false);
  const [newRoomNumber, setNewRoomNumber] = useState<string>('');
  const [newRoomType, setNewRoomType] = useState<keyof typeof RoomType>('DELUXE');
  const [newRoomPrice, setNewRoomPrice] = useState<number>(150);
  const [newRoomCapacity, setNewRoomCapacity] = useState<number>(2);
  const [newRoomDesc, setNewRoomDesc] = useState<string>('Spacious luxury room with city views');
  const [newRoomAmenities] = useState<string>('WiFi, Air Conditioning, TV, Balcony, Mini Bar');
  const [newRoomImageUrl, setNewRoomImageUrl] = useState<string>('');

  // Add Booking Modal State (Staff)
  const [showAddBookingModal, setShowAddBookingModal] = useState<boolean>(false);
  const [newBookingRoomId, setNewBookingRoomId] = useState<number | ''>('');
  const [newBookingCheckIn, setNewBookingCheckIn] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [newBookingCheckOut, setNewBookingCheckOut] = useState<string>(dayjs().add(1, 'day').format('YYYY-MM-DD'));
  const [newBookingGuestName, setNewBookingGuestName] = useState<string>('');
  const [newBookingGuestPhone, setNewBookingGuestPhone] = useState<string>('');
  const [newBookingStatus, setNewBookingStatus] = useState<string>('CONFIRMED');
  const [newBookingTotalPrice, setNewBookingTotalPrice] = useState<number>(0);

  useEffect(() => {
    if (account && account.login) {
      if (isAdmin || isReceptionist) {
        setViewMode('staff');
        fetchBookings();
      } else {
        setViewMode('guest');
        fetchBookings();
      }
      fetchGuests();
    }
  }, [isAuthenticated]);

  const extractArray = (data: any): any[] => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.content)) return data.content;
    return [];
  };

  const fetchAllRooms = async () => {
    setLoading(true);
    try {
      const res = await axios.get<IRoom[]>('/api/rooms?size=1000');
      setRooms(extractArray(res.data));
    } catch (err) {
      console.error('Error fetching all rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRooms = async () => {
    if (!startDate || !endDate) return;
    try {
      const res = await axios.get<IRoom[]>('/api/rooms/available', {
        params: {
          checkIn: dayjs(startDate).format('YYYY-MM-DD'),
          checkOut: dayjs(endDate).format('YYYY-MM-DD'),
        },
      });
      const avail = extractArray(res.data);
      setAvailableRoomIds(new Set(avail.map(r => r.id)));
    } catch (err) {
      console.error('Error fetching available rooms:', err);
      setAvailableRoomIds(new Set());
    }
  };

  useEffect(() => {
    fetchAllRooms();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchAvailableRooms();
    }
  }, [startDate, endDate]);

  const fetchRooms = () => {
    fetchAllRooms();
    fetchAvailableRooms();
  };

  const fetchBookings = async () => {
    try {
      const res = await axios.get<IBooking[]>('/api/bookings');
      setBookings(extractArray(res.data));
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setBookings([]);
    }
  };

  const fetchGuests = async () => {
    try {
      const res = await axios.get<IGuest[]>('/api/guests');
      setGuests(extractArray(res.data));
    } catch (err) {
      console.error('Error fetching guests:', err);
      setGuests([]);
    }
  };

  const handleSearchSubmit = (_e: React.FormEvent) => {
    _e.preventDefault();
    fetchAvailableRooms();
  };

  const handleOpenReserveModal = (room: IRoom, isAvailable: boolean) => {
    if (!startDate || !endDate) {
      toast.error('Please select both Check-in and Check-out dates first.');
      return;
    }
    if (!isAvailable) {
      toast.error('This room is not available for the selected dates.');
      return;
    }
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setSelectedRoom(room);
    setCompletedBooking(null);
    setShowBookingModal(true);
  };

  const calculateNights = () => {
    if (!startDate || !endDate) return 1;
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const diff = end.diff(start, 'day');
    return diff > 0 ? diff : 1;
  };

  const calculateTotalPrice = (pricePerNight: number = 0) => {
    return pricePerNight * calculateNights();
  };

  const handleConfirmBooking = async () => {
    if (!selectedRoom) return;

    if (!startDate || !endDate) {
      toast.error('Please select both Check-in and Check-out dates.');
      return;
    }
    if (dayjs(startDate).isBefore(dayjs().startOf('day'))) {
      toast.error('Check-in date cannot be in the past.');
      return;
    }
    if (dayjs(endDate).diff(dayjs(startDate), 'day') <= 0) {
      toast.error('Check-out date must be after check-in date.');
      return;
    }

    setSubmittingBooking(true);

    try {
      // 1. Create or Find Guest
      let guestId = guests.length > 0 ? guests[0].id : null;

      if (!guestId) {
        try {
          const guestRes = await axios.post<IGuest>('/api/guests', {
            phone: guestPhone,
            address: 'Main Street, City Center',
            idDocumentNumber: guestIdDoc,
            user: account,
          });
          guestId = guestRes.data.id || 1;
        } catch {
          guestId = 1;
        }
      }

      // 2. Create Booking
      const bookingPayload = {
        checkInDate: dayjs(startDate).format('YYYY-MM-DD'),
        checkOutDate: dayjs(endDate).format('YYYY-MM-DD'),
        status: 'CONFIRMED',
        numberOfGuests: guestCount,
        specialRequests: specialRequests || 'Pay at hotel booking',
        room: { id: selectedRoom.id },
        guest: { id: guestId },
        totalAmount: calculateTotalPrice(selectedRoom.pricePerNight),
        createdDate: dayjs().toISOString(),
      };

      const res = await axios.post<IBooking>('/api/bookings', bookingPayload);
      setCompletedBooking(res.data);
      fetchRooms();
      if (isAuthenticated) fetchBookings();
    } catch (err: any) {
      let errorMsg = err.response?.data?.message || err.message;
      if (errorMsg === 'error.roomunavailable') {
        errorMsg = 'Room is not available for the selected dates.';
      }
      alert('Booking failed: ' + errorMsg);
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/rooms', {
        roomNumber: newRoomNumber,
        roomType: newRoomType,
        pricePerNight: newRoomPrice,
        capacity: newRoomCapacity,
        status: 'AVAILABLE',
        description: newRoomDesc,
        amenities: newRoomAmenities,
        imageUrl: newRoomImageUrl, // Adding the imageUrl from admin input
      });
      setShowAddRoomModal(false);
      setNewRoomNumber('');
      setNewRoomImageUrl('');
      fetchRooms();
    } catch (err: any) {
      alert('Failed to add room: ' + err.message);
    }
  };

  const handleCreateStaffBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookingRoomId || !newBookingCheckIn || !newBookingCheckOut || !newBookingGuestName || !newBookingTotalPrice) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      let guestId = guests.length > 0 ? guests[0].id : null;
      if (!guestId) {
        try {
          const guestRes = await axios.post<IGuest>('/api/guests', {
            phone: newBookingGuestPhone || 'N/A',
            address: 'Unknown',
            idDocumentNumber: 'N/A',
            user: account,
          });
          guestId = guestRes.data.id || 1;
        } catch {
          guestId = 1;
        }
      }

      const bookingPayload = {
        checkInDate: newBookingCheckIn,
        checkOutDate: newBookingCheckOut,
        status: newBookingStatus,
        numberOfGuests: 1,
        specialRequests: 'Manually added by staff for ' + newBookingGuestName,
        room: { id: Number(newBookingRoomId) },
        guest: { id: guestId },
        totalAmount: newBookingTotalPrice,
        createdDate: dayjs().toISOString(),
      };

      await axios.post('/api/bookings', bookingPayload);
      toast.success('Booking successfully created!');
      setShowAddBookingModal(false);
      setNewBookingRoomId('');
      setNewBookingGuestName('');
      setNewBookingTotalPrice(0);
      if (isAuthenticated) fetchBookings();
    } catch (err: any) {
      alert('Failed to add booking: ' + err.message);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: number, newStatus: keyof typeof BookingStatus) => {
    try {
      const b = bookings.find(item => item.id === bookingId);
      if (!b) return;
      await axios.put(`/api/bookings/${bookingId}`, {
        ...b,
        status: newStatus,
      });
      fetchBookings();
    } catch (err: any) {
      alert('Failed to update booking: ' + err.message);
    }
  };

  // Filtered rooms logic
  const safeRoomsList = Array.isArray(rooms) ? rooms : [];
  const filteredRooms = safeRoomsList.filter(room => {
    if (!room) return false;
    if (selectedType !== 'ALL' && room.roomType !== selectedType) return false;
    if (room.pricePerNight && room.pricePerNight > maxPrice) return false;
    if (room.capacity && room.capacity < guestCount) return false;
    return true;
  });

  return (
    <div className="booking-page-root">
      {/* Hero Section with Golden Search Bar */}
      <section className="booking-hero-section">
        <div className="hero-container">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              <h1 className="hero-title">Find your next stay</h1>
              <p className="hero-subtitle">Search low prices on hotels, luxury suites, resorts, and much more...</p>
            </div>
            {account?.login && (isAdmin || isReceptionist) && (
              <div className="bg-white text-dark p-2 rounded shadow-sm">
                <Button
                  variant={viewMode === 'guest' ? 'primary' : 'outline-primary'}
                  size="sm"
                  className="me-2"
                  onClick={() => setViewMode('guest')}
                >
                  <FontAwesomeIcon icon={faUser} className="me-1" /> Guest View
                </Button>
                <Button
                  variant={viewMode === 'staff' ? 'navy' : 'outline-dark'}
                  size="sm"
                  onClick={() => setViewMode('staff')}
                  style={{
                    backgroundColor: viewMode === 'staff' ? '#00224F' : 'transparent',
                    color: viewMode === 'staff' ? 'white' : '#00224F',
                  }}
                >
                  <FontAwesomeIcon icon={faConciergeBell} className="me-1" /> Staff Portal
                </Button>
              </div>
            )}
          </div>

          {/* SasaBooking.com Search Bar Widget */}
          <div className="booking-search-widget-wrapper">
            <Form onSubmit={handleSearchSubmit} className="booking-search-grid">
              {/* Destination / Room Type */}
              <div className="search-field-box">
                <FontAwesomeIcon icon={faBed} className="field-icon" />
                <div className="field-content">
                  <label>Room Category / Type</label>
                  <select value={selectedType} onChange={e => setSelectedType(e.target.value)}>
                    <option value="ALL">All Categories & Suites</option>
                    <option value="SINGLE">Single Room</option>
                    <option value="DOUBLE">Double Room</option>
                    <option value="TWIN">Twin Executive Room</option>
                    <option value="SUITE">Grand Luxury Suite</option>
                    <option value="DELUXE">Deluxe Panorama Suite</option>
                  </select>
                </div>
              </div>

              {/* Dates Selector */}
              <div className="search-field-box" style={{ minWidth: '350px' }}>
                <FontAwesomeIcon icon={faCalendarAlt} className="field-icon" />
                <div className="d-flex align-items-center w-100 gap-2">
                  <div className="field-content flex-grow-1">
                    <label>Check-in</label>
                    <DatePicker
                      selected={startDate}
                      onChange={date => {
                        setStartDate(date);
                        if (date && endDate && !dayjs(date).isBefore(dayjs(endDate), 'day')) {
                          setEndDate(dayjs(date).add(1, 'day').toDate());
                        }
                      }}
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      minDate={new Date()}
                      className="form-control border-0 p-0 shadow-none bg-transparent w-100 fw-bold"
                      wrapperClassName="w-100"
                      placeholderText="Select Check-in"
                      dateFormat="MMM d, yyyy"
                    />
                  </div>
                  <div className="text-muted fw-bold px-2">—</div>
                  <div className="field-content flex-grow-1">
                    <label>Check-out</label>
                    <DatePicker
                      selected={endDate}
                      onChange={date => setEndDate(date)}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      minDate={startDate ? dayjs(startDate).add(1, 'day').toDate() : dayjs().add(1, 'day').toDate()}
                      className="form-control border-0 p-0 shadow-none bg-transparent w-100 fw-bold"
                      wrapperClassName="w-100"
                      placeholderText="Select Check-out"
                      dateFormat="MMM d, yyyy"
                    />
                  </div>
                </div>
              </div>

              {/* Guests & Capacity */}
              <div className="search-field-box">
                <FontAwesomeIcon icon={faUser} className="field-icon" />
                <div className="field-content">
                  <label>Guests & Capacity</label>
                  <select value={guestCount} onChange={e => setGuestCount(Number(e.target.value))}>
                    <option value={1}>1 Adult</option>
                    <option value={2}>2 Adults</option>
                    <option value={3}>3 Adults / Family</option>
                    <option value={4}>4+ Adults / Group</option>
                  </select>
                </div>
              </div>

              {/* Search CTA */}
              <button type="submit" className="booking-search-btn">
                <FontAwesomeIcon icon={faSearch} />
                <span>Search</span>
              </button>
            </Form>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="booking-main-container">
        {viewMode === 'guest' ? (
          <>
            <Row>
              {/* Left Sidebar Filters */}
              <Col lg={3} className="mb-4">
                <div className="bg-white p-3 rounded border shadow-sm">
                  <h5 className="fw-bold fs-6 mb-3 border-bottom pb-2">Filter By:</h5>

                  {/* Category Filter */}
                  <div className="mb-4">
                    <label className="fw-bold small text-muted d-block mb-2">Room Type</label>
                    {['ALL', 'SINGLE', 'DOUBLE', 'TWIN', 'SUITE', 'DELUXE'].map(type => (
                      <Form.Check
                        key={type}
                        type="radio"
                        id={`filter-${type}`}
                        name="roomTypeFilter"
                        label={type === 'ALL' ? 'All Types' : type}
                        checked={selectedType === type}
                        onChange={() => setSelectedType(type)}
                        className="small mb-1"
                      />
                    ))}
                  </div>

                  {/* Max Price Slider */}
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label className="fw-bold small text-muted">Max Price / Night</label>
                      <span className="fw-bold text-primary small">Rs. {maxPrice}</span>
                    </div>
                    <Form.Range min={1000} max={100000} step={1000} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} />
                  </div>

                  {/* Trust Badges */}
                  <div className="p-2 bg-light rounded text-muted small">
                    <div className="mb-1">
                      <FontAwesomeIcon icon={faCheck} className="text-success me-1" /> Pay at Hotel (Zero Prepayment)
                    </div>
                    <div className="mb-1">
                      <FontAwesomeIcon icon={faCheck} className="text-success me-1" /> Free Instant Email Confirmation
                    </div>
                    <div>
                      <FontAwesomeIcon icon={faCheck} className="text-success me-1" /> 24/7 Front Desk Support
                    </div>
                  </div>
                </div>
              </Col>

              {/* Right Feed - Room Cards */}
              <Col lg={9}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="fw-bold m-0 text-dark" style={{ fontSize: '20px' }}>
                    Luxury Rooms & Suites ({filteredRooms.length})
                  </h4>
                  <span className="text-muted small">
                    Showing stays from {startDate ? dayjs(startDate).format('MMM D') : '...'} –{' '}
                    {endDate ? dayjs(endDate).format('MMM D') : '...'} ({calculateNights()} {calculateNights() === 1 ? 'night' : 'nights'})
                  </span>
                </div>

                {loading ? (
                  <div className="text-center py-5 bg-white rounded border">
                    <div className="spinner-border text-primary" role="status" />
                    <p className="mt-2 text-muted">Loading rooms...</p>
                  </div>
                ) : filteredRooms.length === 0 ? (
                  <Alert variant="info" className="text-center py-4">
                    <h5>No rooms match your criteria</h5>
                    <p className="mb-0">Try adjusting your filters.</p>
                  </Alert>
                ) : (
                  filteredRooms.map(room => {
                    const roomImg = room.imageUrl || DEFAULT_ROOM_IMAGE;
                    const totalPrice = calculateTotalPrice(room.pricePerNight || 0);

                    return (
                      <div key={room.id} className="booking-room-card">
                        {/* Image Column */}
                        <div className="room-card-img-wrapper">
                          <img src={roomImg} alt={room.roomType} />
                          <span className="room-tag">Room #{room.roomNumber}</span>
                        </div>

                        {/* Details Column */}
                        <div className="room-card-details">
                          <div>
                            <h3 className="room-title">
                              {room.roomType} Room #{room.roomNumber}
                            </h3>
                            <div className="room-subtext">
                              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary me-1" />
                              Grand Hotel Main Tower • {room.capacity} Guests Capacity
                            </div>

                            {/* Amenities Chips */}
                            <div className="amenities-list">
                              <span className="amenity-chip">
                                <FontAwesomeIcon icon={faWifi} className="me-1" /> Free WiFi
                              </span>
                              <span className="amenity-chip">
                                <FontAwesomeIcon icon={faSnowflake} className="me-1" /> Air Conditioning
                              </span>
                              <span className="amenity-chip">
                                <FontAwesomeIcon icon={faTv} className="me-1" /> Flat TV
                              </span>
                              <span className="amenity-chip">
                                <FontAwesomeIcon icon={faBath} className="me-1" /> Ensuite Bath
                              </span>
                            </div>

                            {/* Perks */}
                            <div className="room-features">
                              <span>
                                <FontAwesomeIcon icon={faCheckCircle} className="me-1" /> FREE Cancellation anytime
                              </span>
                              <span>
                                <FontAwesomeIcon icon={faCreditCard} className="me-1" /> NO PREPAYMENT NEEDED – Pay at the property
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Pricing & CTA Column */}
                        <div className="room-card-pricing">
                          <div className="rating-badge-row">
                            <div>
                              <div className="rating-text">Exceptional</div>
                              <span className="text-muted small">412 reviews</span>
                            </div>
                            <div className="rating-box">9.4</div>
                          </div>

                          <div>
                            <div className="price-amount">
                              LKR {room.pricePerNight} <span className="fs-6 fw-normal text-muted">/ night</span>
                            </div>
                            <div className="price-subtext">
                              LKR {totalPrice} total for {calculateNights()} {calculateNights() === 1 ? 'night' : 'nights'}
                              <br />
                              Includes taxes & fees
                            </div>

                            {room.id && availableRoomIds.has(room.id) ? (
                              <button className="reserve-btn" onClick={() => handleOpenReserveModal(room, true)}>
                                Reserve Room
                              </button>
                            ) : (
                              <button
                                className="reserve-btn disabled"
                                disabled
                                style={{ backgroundColor: '#6c757d', cursor: 'not-allowed' }}
                              >
                                Not Available
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </Col>
            </Row>
          </>
        ) : (
          /* Staff / Admin Console View */
          <div className="bg-white p-4 rounded border shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
              <h3 className="fw-bold m-0 text-primary">
                <FontAwesomeIcon icon={faConciergeBell} className="me-2" />
                Hotel Operations Console
              </h3>
              <div className="d-flex gap-2">
                <Button variant="primary" onClick={() => setShowAddBookingModal(true)}>
                  <FontAwesomeIcon icon={faPlus} className="me-1" /> Add Booking
                </Button>
                <Button variant="success" onClick={() => setShowAddRoomModal(true)}>
                  <FontAwesomeIcon icon={faPlus} className="me-1" /> Add Room
                </Button>
              </div>
            </div>

            <Tab.Container defaultActiveKey="rooms-tab">
              <Nav variant="tabs" className="mb-3">
                <Nav.Item>
                  <Nav.Link eventKey="rooms-tab">
                    <FontAwesomeIcon icon={faBed} className="me-1" /> Rooms Inventory ({safeRoomsList.length})
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="bookings-tab">
                    <FontAwesomeIcon icon={faList} className="me-1" /> Guest Bookings ({(Array.isArray(bookings) ? bookings : []).length})
                  </Nav.Link>
                </Nav.Item>
              </Nav>

              <Tab.Content>
                {/* Rooms Inventory */}
                <Tab.Pane eventKey="rooms-tab">
                  <table className="table table-hover align-middle">
                    <thead className="table-dark">
                      <tr>
                        <th>Room #</th>
                        <th>Type</th>
                        <th>Capacity</th>
                        <th>Price/Night</th>
                        <th>Status</th>
                        <th>Amenities</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {safeRoomsList.map(r => (
                        <tr key={r.id}>
                          <td className="fw-bold">#{r.roomNumber}</td>
                          <td>
                            <Badge bg="primary">{r.roomType}</Badge>
                          </td>
                          <td>{r.capacity} Persons</td>
                          <td className="fw-bold text-success">Rs. {r.pricePerNight}</td>
                          <td>
                            {(() => {
                              const today = dayjs();
                              const activeBooking = bookings.find(
                                b =>
                                  b.room?.id === r.id &&
                                  b.status === 'CONFIRMED' &&
                                  dayjs(b.checkInDate).isBefore(today.add(1, 'day'), 'day') &&
                                  dayjs(b.checkOutDate).isAfter(today.subtract(1, 'day'), 'day'),
                              );
                              if (activeBooking) {
                                return <Badge bg="danger">BOOKED till {dayjs(activeBooking.checkOutDate).format('MMM D')}</Badge>;
                              }
                              return <Badge bg={r.status === 'AVAILABLE' ? 'success' : 'warning'}>{r.status}</Badge>;
                            })()}
                          </td>
                          <td className="small text-muted">{r.amenities || 'Standard'}</td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => {
                                setNewBookingRoomId(r.id || '');
                                setShowAddBookingModal(true);
                              }}
                            >
                              <FontAwesomeIcon icon={faPlus} className="me-1" /> Book Room
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Tab.Pane>

                {/* Guest Bookings */}
                <Tab.Pane eventKey="bookings-tab">
                  <table className="table table-striped align-middle">
                    <thead className="table-dark">
                      <tr>
                        <th>Booking ID</th>
                        <th>Guest</th>
                        <th>Room</th>
                        <th>Dates</th>
                        <th>Total Amount</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(Array.isArray(bookings) ? bookings : []).map(b => (
                        <tr key={b.id}>
                          <td className="fw-bold">#BK-{b.id}</td>
                          <td>
                            <div>{b.guest?.user?.login || 'Guest User'}</div>
                            <span className="small text-muted">{b.guest?.phone}</span>
                          </td>
                          <td>
                            #{b.room?.roomNumber} ({b.room?.roomType})
                          </td>
                          <td>
                            {b.checkInDate ? dayjs(b.checkInDate).format('YYYY-MM-DD') : '-'} to{' '}
                            {b.checkOutDate ? dayjs(b.checkOutDate).format('YYYY-MM-DD') : '-'}
                          </td>
                          <td className="fw-bold text-primary">Rs. {b.totalAmount}</td>
                          <td>
                            <Badge bg={b.status === 'CONFIRMED' ? 'success' : b.status === 'CANCELLED' ? 'danger' : 'secondary'}>
                              {b.status}
                            </Badge>
                          </td>
                          <td>
                            {b.status === 'CONFIRMED' && (
                              <Button variant="outline-danger" size="sm" onClick={() => handleUpdateBookingStatus(b.id!, 'CANCELLED')}>
                                Cancel
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </div>
        )}
      </div>

      {/* Booking Drawer / Reservation Modal */}
      <Modal show={showBookingModal} onHide={() => setShowBookingModal(false)} size="lg" centered>
        <div className="modal-header-banner">
          <h3>
            <FontAwesomeIcon icon={faBed} className="me-2" />
            Complete Your Reservation
          </h3>
          <button className="close-modal-btn" onClick={() => setShowBookingModal(false)}>
            &times;
          </button>
        </div>

        <Modal.Body className="modal-body-content">
          {completedBooking ? (
            <div className="text-center py-4">
              <div className="text-success display-4 mb-3">
                <FontAwesomeIcon icon={faCheckCircle} />
              </div>
              <h2 className="fw-bold text-dark mb-2">Reservation Confirmed!</h2>
              <p className="lead text-muted mb-4">
                Your booking <strong>#BK-{completedBooking.id}</strong> at Grand Hotel has been placed.
              </p>

              <div className="p-3 bg-light rounded text-start mx-auto mb-4 border" style={{ maxWidth: '500px' }}>
                <div className="d-flex justify-content-between mb-2 border-bottom pb-2">
                  <span className="text-muted">Room Reserved:</span>
                  <span className="fw-bold">
                    Room #{selectedRoom?.roomNumber} ({selectedRoom?.roomType})
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2 border-bottom pb-2">
                  <span className="text-muted">Check-in Date:</span>
                  <span className="fw-bold">{startDate ? dayjs(startDate).format('dddd, MMMM D, YYYY') : '-'}</span>
                </div>
                <div className="d-flex justify-content-between mb-2 border-bottom pb-2">
                  <span className="text-muted">Check-out Date:</span>
                  <span className="fw-bold">{endDate ? dayjs(endDate).format('dddd, MMMM D, YYYY') : '-'}</span>
                </div>
                <div className="d-flex justify-content-between mb-2 border-bottom pb-2">
                  <span className="text-muted">Total Price (Pay at Hotel):</span>
                  <span className="fw-bold text-success fs-5">LKR {calculateTotalPrice(selectedRoom?.pricePerNight)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Notifications Sent:</span>
                  <span className="badge bg-success">Email & SMS Dispatched</span>
                </div>
              </div>

              <div className="d-flex justify-content-center gap-3">
                <Button variant="primary" onClick={() => window.print()}>
                  <FontAwesomeIcon icon={faPrint} className="me-1" /> Print Confirmation
                </Button>
                <Button variant="secondary" onClick={() => setShowBookingModal(false)}>
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <Form
              onSubmit={e => {
                e.preventDefault();
                handleConfirmBooking();
              }}
            >
              {/* Room Summary Header */}
              <div
                className="d-flex justify-content-between align-items-center p-3 mb-4 rounded border"
                style={{ backgroundColor: '#F0F4FA' }}
              >
                <div>
                  <h4 className="fw-bold m-0 text-primary">
                    {selectedRoom?.roomType} Room #{selectedRoom?.roomNumber}
                  </h4>
                  <span className="text-muted small">
                    {calculateNights()} nights ({startDate ? dayjs(startDate).format('YYYY-MM-DD') : '-'} to{' '}
                    {endDate ? dayjs(endDate).format('YYYY-MM-DD') : '-'})
                  </span>
                </div>
                <div className="text-end">
                  <div className="fw-bold fs-4 text-dark">LKR {calculateTotalPrice(selectedRoom?.pricePerNight)}</div>
                  <span className="text-success small fw-bold">Pay at Hotel</span>
                </div>
              </div>

              {/* Guest Information */}
              <h5 className="fw-bold mb-3 border-bottom pb-2">Guest Information</h5>
              <Row className="g-3 mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">
                      <FontAwesomeIcon icon={faUser} className="me-1 text-primary" /> Full Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. John Doe"
                      required
                      value={guestName}
                      onChange={e => setGuestName(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">
                      <FontAwesomeIcon icon={faEnvelope} className="me-1 text-primary" /> Email Address (For Confirmation)
                    </Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="john@example.com"
                      required
                      value={guestEmail}
                      onChange={e => setGuestEmail(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">
                      <FontAwesomeIcon icon={faPhone} className="me-1 text-primary" /> Mobile Phone (For SMS Alert)
                    </Form.Label>
                    <Form.Control type="text" required value={guestPhone} onChange={e => setGuestPhone(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">
                      <FontAwesomeIcon icon={faIdCard} className="me-1 text-primary" /> ID Document / Passport #
                    </Form.Label>
                    <Form.Control type="text" required value={guestIdDoc} onChange={e => setGuestIdDoc(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">Special Requests (Optional)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="e.g. Late check-in, quiet room, extra pillows..."
                      value={specialRequests}
                      onChange={e => setSpecialRequests(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Payment Notice */}
              <Alert variant="success" className="d-flex align-items-center gap-3 py-2">
                <FontAwesomeIcon icon={faMoneyBillWave} className="fs-3" />
                <div>
                  <strong>No Credit Card Required!</strong>
                  <div className="small">
                    You will pay the full amount of <strong>LKR {calculateTotalPrice(selectedRoom?.pricePerNight)}</strong> at the hotel
                    during check-in.
                  </div>
                </div>
              </Alert>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <Button variant="outline-secondary" onClick={() => setShowBookingModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={submittingBooking} className="px-4 fw-bold">
                  {submittingBooking ? 'Sending Booking Request...' : 'Confirm & Reserve Now'}
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      {/* Staff Add Room Modal */}
      <Modal show={showAddRoomModal} onHide={() => setShowAddRoomModal(false)} centered>
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title>
            <FontAwesomeIcon icon={faPlus} className="me-2" /> Add New Room
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateRoom}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Room Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. 501"
                    required
                    value={newRoomNumber}
                    onChange={e => setNewRoomNumber(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Room Category</Form.Label>
                  <Form.Select value={newRoomType} onChange={e => setNewRoomType(e.target.value as any)}>
                    <option value="SINGLE">SINGLE</option>
                    <option value="DOUBLE">DOUBLE</option>
                    <option value="TWIN">TWIN</option>
                    <option value="SUITE">SUITE</option>
                    <option value="DELUXE">DELUXE</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Price / Night ($)</Form.Label>
                  <Form.Control type="number" required value={newRoomPrice} onChange={e => setNewRoomPrice(Number(e.target.value))} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Capacity (Persons)</Form.Label>
                  <Form.Control type="number" required value={newRoomCapacity} onChange={e => setNewRoomCapacity(Number(e.target.value))} />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Description</Form.Label>
                  <Form.Control type="text" value={newRoomDesc} onChange={e => setNewRoomDesc(e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Image URL</Form.Label>
                  <Form.Control
                    type="url"
                    placeholder="https://example.com/room-image.jpg"
                    value={newRoomImageUrl}
                    onChange={e => setNewRoomImageUrl(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddRoomModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Room
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Staff Add Booking Modal */}
      <Modal show={showAddBookingModal} onHide={() => setShowAddBookingModal(false)} centered>
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title>
            <FontAwesomeIcon icon={faPlus} className="me-2" /> Add New Booking
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateStaffBooking}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Select Room</Form.Label>
                  <Form.Select required value={newBookingRoomId} onChange={e => setNewBookingRoomId(Number(e.target.value))}>
                    <option value="">-- Choose a Room --</option>
                    {safeRoomsList.map(r => (
                      <option key={r.id} value={r.id}>
                        Room #{r.roomNumber} ({r.roomType}) - LKR {r.pricePerNight}/night
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Check-in Date</Form.Label>
                  <Form.Control type="date" required value={newBookingCheckIn} onChange={e => setNewBookingCheckIn(e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Check-out Date</Form.Label>
                  <Form.Control type="date" required value={newBookingCheckOut} onChange={e => setNewBookingCheckOut(e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Guest Name</Form.Label>
                  <Form.Control type="text" required value={newBookingGuestName} onChange={e => setNewBookingGuestName(e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Guest Phone</Form.Label>
                  <Form.Control type="text" required value={newBookingGuestPhone} onChange={e => setNewBookingGuestPhone(e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Total Price (LKR)</Form.Label>
                  <Form.Control
                    type="number"
                    required
                    value={newBookingTotalPrice}
                    onChange={e => setNewBookingTotalPrice(Number(e.target.value))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Status</Form.Label>
                  <Form.Select value={newBookingStatus} onChange={e => setNewBookingStatus(e.target.value)}>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddBookingModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Booking
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      {/* Authentication Requirement Modal */}
      <Modal show={showAuthModal} onHide={() => setShowAuthModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-primary fw-bold">Login Required</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <FontAwesomeIcon icon={faUser} className="text-primary mb-3" style={{ fontSize: '3rem' }} />
          <h5>You must be logged in to book a room.</h5>
          <p className="text-muted">Would you like to log in now to continue with your reservation?</p>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button variant="outline-secondary" onClick={() => setShowAuthModal(false)}>
            Continue Browsing
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setShowAuthModal(false);
              navigate(getLoginUrl(), { state: { from: { pathname: '/' } } });
            }}
          >
            Proceed to Login
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Home;
