import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
// TODO: Replace with MongoDB search logic

const SearchPage = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const searchQuery = new URLSearchParams(location.search).get('q');
    if (searchQuery) {
      performSearch(searchQuery);
    }
  }, [location.search]);

  const performSearch = async (searchQuery) => {
    setLoading(true);
    const results = [];

    // Search in users
    const usersQuery = query(collection(db, 'users'), where('name', '>=', searchQuery), where('name', '<=', searchQuery + '\uf8ff'));
    const usersSnapshot = await getDocs(usersQuery);
    usersSnapshot.forEach((doc) => {
      results.push({ id: doc.id, type: 'user', ...doc.data() });
    });

    // Search in events
    const eventsQuery = query(collection(db, 'events'), where('title', '>=', searchQuery), where('title', '<=', searchQuery + '\uf8ff'));
    const eventsSnapshot = await getDocs(eventsQuery);
    eventsSnapshot.forEach((doc) => {
      results.push({ id: doc.id, type: 'event', ...doc.data() });
    });

    // Search in challenges
    const challengesQuery = query(collection(db, 'challenges'), where('title', '>=', searchQuery), where('title', '<=', searchQuery + '\uf8ff'));
    const challengesSnapshot = await getDocs(challengesQuery);
    challengesSnapshot.forEach((doc) => {
      results.push({ id: doc.id, type: 'challenge', ...doc.data() });
    });

    setSearchResults(results);
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Search Results</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {searchResults.map((result) => (
            <div key={result.id} className="border-b py-4">
              <h2 className="text-xl font-bold">{result.title || result.name}</h2>
              <p className="text-gray-600">{result.type}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
