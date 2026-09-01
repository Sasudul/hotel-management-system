import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import { JhiPagination, JhiItemCount } from 'react-jhipster';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory } from '@fortawesome/free-solid-svg-icons';
import dayjs from 'dayjs';
import { ITEMS_PER_PAGE } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';
import { useLocation, useNavigate } from 'react-router';

export const Audits = () => {
  const [audits, setAudits] = useState<any[]>([]);
  const [paginationState, setPaginationState] = useState(
    overridePaginationStateWithQueryParams(
      { activePage: 1, itemsPerPage: ITEMS_PER_PAGE, sort: 'performedDate', order: 'desc' },
      useLocation().search,
    ),
  );
  const [totalItems, setTotalItems] = useState(0);

  const navigate = useNavigate();

  const getAudits = () => {
    axios
      .get(
        `/api/admin/audits?page=${paginationState.activePage - 1}&size=${paginationState.itemsPerPage}&sort=${paginationState.sort},${paginationState.order}`,
      )
      .then(response => {
        setAudits(response.data);
        setTotalItems(parseInt(response.headers['x-total-count'], 10));
      });
  };

  useEffect(() => {
    getAudits();
  }, [paginationState.activePage, paginationState.order, paginationState.sort]);

  const handlePagination = currentPage => {
    setPaginationState({
      ...paginationState,
      activePage: currentPage,
    });
    navigate(`/admin/audits?page=${currentPage}&sort=${paginationState.sort},${paginationState.order}`);
  };

  const getBadgeClass = action => {
    switch (action) {
      case 'CREATE':
        return 'badge bg-success';
      case 'UPDATE':
        return 'badge bg-warning';
      case 'DELETE':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  };

  return (
    <div>
      <h2 id="audits-page-heading" data-cy="auditsPageHeading">
        <FontAwesomeIcon icon={faHistory} /> Activity Logs
      </h2>
      <p className="text-muted">A complete history of actions performed by staff members on Bookings and Rooms.</p>
      <div className="table-responsive">
        <Table striped responsive>
          <thead>
            <tr>
              <th>Date</th>
              <th>User</th>
              <th>Action</th>
              <th>Entity Type</th>
              <th>Entity ID</th>
            </tr>
          </thead>
          <tbody>
            {audits.map((audit, i) => (
              <tr key={`audit-${i}`}>
                <td>{dayjs(audit.performedDate).format('YYYY-MM-DD HH:mm:ss')}</td>
                <td>{audit.performedBy}</td>
                <td>
                  <span className={getBadgeClass(audit.action)}>{audit.action}</span>
                </td>
                <td>{audit.entityName}</td>
                <td>#{audit.entityId}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      {totalItems > 0 ? (
        <div className="p-4 d-flex justify-content-center">
          <div className="justify-content-center d-flex">
            <JhiItemCount page={paginationState.activePage} total={totalItems} itemsPerPage={paginationState.itemsPerPage} />
          </div>
          <div className="justify-content-center d-flex">
            <JhiPagination
              activePage={paginationState.activePage}
              onSelect={handlePagination}
              maxButtons={5}
              itemsPerPage={paginationState.itemsPerPage}
              totalItems={totalItems}
            />
          </div>
        </div>
      ) : (
        <div className="alert alert-warning">No audit logs found.</div>
      )}
    </div>
  );
};

export default Audits;
