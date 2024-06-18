import React, { useState, useEffect } from 'react';
import axios from 'axios';

import './Dashboard.css'

function Dashboard() {
  const [message, setMessage] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      try {
        const res = await axios.get('http://localhost:5000/data', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage(res.data.message);
        
        // Decode the token to get the user's role
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        setRole(decodedToken.role);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const handleAction = async (action) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    let url = 'http://localhost:5000/data';
    let method = 'GET';
    if (action === 'write') method = 'POST';
    if (action === 'update') method = 'PUT';
    if (action === 'delete') method = 'DELETE';

    try {
      const res = await axios({
        url,
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(res.data.message);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className='dashboard-container'>
      <h3>Logged as: {role}</h3>
      <h2>Dashboard</h2>
      <p>{message}</p>
      {role === 'manager' && (
        <div>
          <button onClick={() => handleAction('write')}>Write Data</button>
          <button onClick={() => handleAction('update')}>Update Data</button>
          <button onClick={() => handleAction('delete')}>Delete Data</button>
        </div>
      )}
      {role === 'teamleader' && (
        <div>
          <button onClick={() => handleAction('write')}>Write Data</button>
          <button onClick={() => handleAction('update')}>Update Data</button>
        </div>
      )}
      {role === 'user' && (
        <div>
          <p>You have read-only access.</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
