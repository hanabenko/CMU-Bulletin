import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, onSnapshot, orderBy, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import Modal from './Modal'; // Import the new Modal component

// Helper function to check if a recurring event occurs on a specific date
const isRecurringEventOnDate = (poster, checkDateString) => {
  if (!poster.repeating || !poster.next_occurring_date) {
    return false;
  }

  // Add T00:00:00 to avoid timezone issues when creating Date objects from YYYY-MM-DD strings
  const checkDate = new Date(`${checkDateString}T00:00:00`);
  const startDate = new Date(`${poster.next_occurring_date}T00:00:00`);

  // The date to check must be on or after the start date of the event.
  if (checkDate < startDate) {
    return false;
  }

  const frequency = poster.frequency;
  const daysOfWeek = poster.days_of_week || []; // ['Monday', 'Tuesday', ...]
  const dayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const checkDayName = dayMap[checkDate.getDay()];

  // For any repeating event, it must fall on an allowed day of the week if specified.
  if (daysOfWeek.length > 0 && !daysOfWeek.includes(checkDayName)) {
    return false;
  }

  switch (frequency) {
    case 'daily':
      return true;

    case 'weekly':
      return true; // The day of the week check above is sufficient

    case 'bi-weekly': {
      // Find the start of the week for both dates (Sunday = 0)
      const weekStartForStartDate = new Date(startDate.getTime());
      weekStartForStartDate.setDate(startDate.getDate() - startDate.getDay());
      weekStartForStartDate.setHours(0, 0, 0, 0);

      const weekStartForCheckDate = new Date(checkDate.getTime());
      weekStartForCheckDate.setDate(checkDate.getDate() - checkDate.getDay());
      weekStartForCheckDate.setHours(0, 0, 0, 0);

      const weekDiff = Math.round((weekStartForCheckDate - weekStartForStartDate) / (1000 * 60 * 60 * 24 * 7));

      return weekDiff % 2 === 0;
    }

    case 'monthly':
      // Assuming 'monthly' means it occurs on the same date of the month.
      return startDate.getDate() === checkDate.getDate();

    default:
      return false;
  }
};

// Helper function to find the next occurrence of a recurring event on or after a given date
const findNextOccurrence = (poster, fromDateString) => {
  if (!poster.repeating || !poster.next_occurring_date) {
    return null;
  }

  const fromDate = new Date(`${fromDateString}T00:00:00`);
  const startDate = new Date(`${poster.next_occurring_date}T00:00:00`);

  // Start checking from the later of fromDate or the event's original start date
  let checkDate = new Date(Math.max(fromDate.getTime(), startDate.getTime()));

  // Limit the search to prevent infinite loops (e.g., 1 year)
  const searchLimit = new Date(fromDate);
  searchLimit.setFullYear(searchLimit.getFullYear() + 1);

  while (checkDate <= searchLimit) {
    const checkDateFormatted = checkDate.toISOString().split('T')[0];
    if (isRecurringEventOnDate(poster, checkDateFormatted)) {
      return checkDateFormatted;
    }
    checkDate.setDate(checkDate.getDate() + 1); // Move to the next day
  }

  return null; // No future occurrence found within the limit
};

function PosterList({ filterDate, filterLocations, filterTags, searchQuery, user }) {
  const [allPosters, setAllPosters] = useState([]);
  const [filteredPosters, setFilteredPosters] = useState([]);
  const [selectedPoster, setSelectedPoster] = useState(null);
  const [likedPosters, setLikedPosters] = useState([]);
  const [uploaderNames, setUploaderNames] = useState({});
  const { category } = useParams();

  useEffect(() => {
    const q = query(collection(db, 'posters'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const postersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })).sort((a, b) => {
        const dateA = a.sort_date || (a.repeating ? a.next_occurring_date : a.single_event_date);
        const dateB = b.sort_date || (b.repeating ? b.next_occurring_date : b.single_event_date);

        const compareDates = new Date(dateA) - new Date(dateB);
        if (compareDates !== 0) {
          return compareDates;
        }

        // If dates are the same, sort by created_at (oldest first)
        const createdAtA = a.created_at ? a.created_at.toDate() : new Date(0);
        const createdAtB = b.created_at ? b.created_at.toDate() : new Date(0);
        return createdAtA - createdAtB;
      });
      setAllPosters(postersData);

      const uploaderIds = [...new Set(postersData.map(p => p.uploaded_by))];
      const names = {};
      for (const poster of postersData) {
        if (poster.organizer) {
          names[poster.id] = poster.organizer;
        } else if (poster.uploaded_by && !names[poster.uploaded_by]) {
          const userDoc = await getDoc(doc(db, 'users', poster.uploaded_by));
          if (userDoc.exists()) {
            names[poster.uploaded_by] = `${userDoc.data().firstName} ${userDoc.data().lastName}`;
          }
        }
      }
      setUploaderNames(names);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const likedRef = collection(db, `users/${user.uid}/likedPosters`);
      const unsubscribeLiked = onSnapshot(likedRef, (snapshot) => {
        setLikedPosters(snapshot.docs.map(doc => doc.id));
      });
      return () => unsubscribeLiked();
    } else {
      setLikedPosters([]);
    }
  }, [user]);

  const handleLikeToggle = async (posterId) => {
    console.log('handleLikeToggle called for posterId:', posterId);
    if (!user) {
      alert('Please sign in to like posters.');
      return;
    }
    const likedRef = doc(db, `users/${user.uid}/likedPosters`, posterId);
    if (likedPosters.includes(posterId)) {
      // Unlike
      console.log('Unliking poster:', posterId);
      await deleteDoc(likedRef);
    } else {
      // Like
      console.log('Liking poster:', posterId);
      await setDoc(likedRef, {}); // Empty object as we only care about the doc ID
    }
    console.log('Current likedPosters after toggle:', likedPosters);
  };

  useEffect(() => {
    const filterCategory = category || 'All';

    let currentPosters = allPosters;

    // Only filter out past events if no specific filterDate is selected
    if (!filterDate) {
      const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
      currentPosters = allPosters.filter(poster => {
        if (poster.repeating) {
          return findNextOccurrence(poster, today) !== null;
        } else {
          return poster.single_event_date >= today;
        }
      });
    }

    if (filterCategory !== 'All') {
      currentPosters = currentPosters.filter(poster => 
        poster.category && poster.category.includes(filterCategory)
      );
    }

    if (filterDate) {
        currentPosters = currentPosters.filter(poster => {
            if (poster.repeating) {
                return isRecurringEventOnDate(poster, filterDate);
            } else {
                return poster.single_event_date === filterDate;
            }
        });
    }

    if (searchQuery) {
      currentPosters = currentPosters.filter(poster => 
        poster.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        poster.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterLocations.length > 0) {
      currentPosters = currentPosters.filter(poster =>
        filterLocations.some(location =>
          poster.location.map(l => l.toLowerCase()).includes(location.toLowerCase())
        )
      );
    }

    if (filterTags.length > 0) {
      currentPosters = currentPosters.filter(poster =>
        filterTags.some(tag =>
          poster.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase())
        )
      );
    }

    setFilteredPosters(currentPosters);
  }, [category, allPosters, filterDate, searchQuery, filterLocations, filterTags]);

  const handlePosterClick = (poster) => {
    setSelectedPoster(poster);
  };

  const handleCloseModal = () => {
    setSelectedPoster(null);
  };

  return (
    <div className="poster-grid">
      {filteredPosters.length === 0 ? (
        <div className="empty-state">
          <h2>No posters yet.</h2>
          <p>Be the first to share something!</p>
        </div>
      ) : (
        filteredPosters.map((poster) => (
          <div key={poster.id} className="poster-card">
            <img src={poster.image_url} alt={poster.title} onClick={() => handlePosterClick(poster)} />
          </div>
        ))
      )}

      {selectedPoster && (
        <Modal 
          poster={selectedPoster} 
          onClose={handleCloseModal} 
          user={user}
          likedPosters={likedPosters}
          handleLikeToggle={handleLikeToggle}
          uploaderName={uploaderNames[selectedPoster.uploaded_by]}
        />
      )}
    </div>
  );
}

export default PosterList;
