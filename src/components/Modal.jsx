// src/components/Modal.jsx
import React from 'react';
import HeartIcon from './HeartIcon';

function Modal({ poster, onClose, user, likedPosters, handleLikeToggle, uploaderName }) {
  if (!poster) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}> {/* Prevent clicks inside from closing modal */}
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        {user && (
          <HeartIcon
            filled={likedPosters.includes(poster.id)}
            onClick={() => {
              console.log('Heart icon clicked for poster:', poster.id);
              handleLikeToggle(poster.id);
            }}
            style={{
              position: 'absolute',
              top: '20px',
              right: '100px',
              width: '30px',
              height: '30px',
              zIndex: 100,
            }}
          />
        )}
        <div className="modal-body">
          <div className="modal-image-container">
            <img src={poster.image_url} alt={poster.title} />
          </div>
          <div className="modal-details-container">
            <h2>{poster.title}</h2>
            <p><strong>Uploaded by:</strong> {uploaderName || 'Unknown'}</p>
            <p>{poster.description}</p>
            {!poster.repeating && poster.single_event_date && (
              <p><strong>Date:</strong> {poster.single_event_date}</p>
            )}
            <p><strong>Location:</strong> {Array.isArray(poster.location) ? poster.location.join(', ') : poster.location}</p>
            <p><strong>Category:</strong> {Array.isArray(poster.category) ? poster.category.join(', ') : poster.category}</p>
            {poster.tags && poster.tags.length > 0 && (
              <p><strong>Tags:</strong> {poster.tags.join(', ')}</p>
            )}
            {poster.repeating && (
              <>
                <p><strong>Next Occurring:</strong> {poster.next_occurring_date}</p>
                <p><strong>Frequency:</strong> {poster.frequency}</p>
                <p><strong>Days:</strong> {poster.days_of_week.join(', ')}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal;