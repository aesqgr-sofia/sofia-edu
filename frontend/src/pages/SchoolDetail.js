// src/pages/SchoolDetail.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const SchoolDetail = () => {
  const { id } = useParams();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`/api/schools/${id}/`)
      .then(response => {
        setSchool(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching school details:', err);
        setError(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Loading school details...</div>;
  if (error) return <div>Error loading school details.</div>;
  if (!school) return <div>No school data available.</div>;

  return (
    <div>
      <h1>{school.name}</h1>
      <p><strong>Address:</strong> {school.address}</p>
      <p><strong>Phone:</strong> {school.phone_number}</p>
      <p><strong>Region:</strong> {school.region?.name}</p>
      <p><strong>School Type:</strong> {school.school_type?.name}</p>

      <h2>Years and Subjects</h2>
      {school.years && school.years.length > 0 ? (
        school.years.map(year => (
          <div key={year.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
            <h3>{year.name} {year.division ? `- ${year.division}` : ''}</h3>
            {year.subjects && year.subjects.length > 0 ? (
              <ul>
                {year.subjects.map(subject => (
                  <li key={subject.id}>
                    <strong>{subject.name}</strong>: {subject.description}
                    <br />
                    <em>Specific Competences:</em>
                    {subject.specific_competences && subject.specific_competences.length > 0 ? (
                      <ul>
                        {subject.specific_competences.map(comp => (
                          <li key={comp.id}>{comp.code}: {comp.description}</li>
                        ))}
                      </ul>
                    ) : <span> None</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No subjects for this year.</p>
            )}
          </div>
        ))
      ) : (
        <p>No years assigned to this school.</p>
      )}
    </div>
  );
};

export default SchoolDetail;
