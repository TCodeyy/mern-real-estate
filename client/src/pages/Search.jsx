import { React, useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ListingCard from '../components/ListingCard';
import { parseAIVoiceCommand } from '../utils/voicePraser';

export default function Search() {
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebardata, setSidebardata] = useState({
    searchTerm: '',
    type: 'all',
    parking: false,
    furnished: false,
    offer: false,
    bedrooms: '',
    bathrooms: '',
    sort: 'createdAt',
    order: 'desc',
  });

  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);

  // Enhanced voice search states
  const [listening, setListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  // Voice feedback responses
  const getVoiceFeedback = (filters) => {
    let feedback = 'I understood: ';
    const parts = [];

    if (filters.type !== 'all') {
      parts.push(
        `looking for ${
          filters.type === 'rent' ? 'rentals' : 'properties for sale'
        }`
      );
    }

    if (filters.searchTerm) {
      parts.push(`in ${filters.searchTerm}`);
    }

    if (filters.bedrooms) {
      parts.push(
        `with ${filters.bedrooms} bedroom${filters.bedrooms > 1 ? 's' : ''}`
      );
    }

    if (filters.bathrooms) {
      parts.push(
        `with ${filters.bathrooms} bathroom${filters.bathrooms > 1 ? 's' : ''}`
      );
    }

    const amenities = [];
    if (filters.parking) amenities.push('parking');
    if (filters.furnished) amenities.push('furnished');
    if (filters.offer) amenities.push('special offers');

    if (amenities.length > 0) {
      parts.push(`with ${amenities.join(', ')}`);
    }

    if (filters.priceRange?.max) {
      parts.push(`under $${filters.priceRange.max.toLocaleString()}`);
    }

    return (
      feedback +
      (parts.length > 0 ? parts.join(', ') : 'searching all properties')
    );
  };

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition || null;
  const recognition = useRef(null);
  const speechSynthesis = window.speechSynthesis;

  // Text-to-speech function
  const speak = (text) => {
    if (speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (SpeechRecognition && !recognition.current) {
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';

      recognition.current.onstart = () => {
        setListening(true);
        setShowVoiceModal(true);
        setVoiceFeedback(
          'Try saying something like "Find 2 bedroom apartments for rent in downtown with parking"'
        );
      };

      recognition.current.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        setIsProcessing(true);
        setVoiceFeedback('Processing your request...');

        setTimeout(() => {
          const parsedFilters = parseAIVoiceCommand(speechResult);
          const feedback = getVoiceFeedback(parsedFilters);

          setVoiceFeedback(feedback);
          speak(feedback);

          // Update form data with parsed results INCLUDING bedrooms/bathrooms
          setSidebardata((prev) => ({
            ...prev,
            searchTerm: parsedFilters.searchTerm || prev.searchTerm,
            type: parsedFilters.type,
            furnished: parsedFilters.furnished,
            parking: parsedFilters.parking,
            offer: parsedFilters.offer,
            bedrooms: parsedFilters.bedrooms
              ? parsedFilters.bedrooms.toString()
              : prev.bedrooms,
            bathrooms: parsedFilters.bathrooms
              ? parsedFilters.bathrooms.toString()
              : prev.bathrooms,
          }));

          setIsProcessing(false);
          setListening(false);

          // Auto-submit the form after voice processing
          setTimeout(() => {
            const urlParams = new URLSearchParams();
            urlParams.set('searchTerm', parsedFilters.searchTerm || '');
            urlParams.set('type', parsedFilters.type);
            urlParams.set('parking', parsedFilters.parking);
            urlParams.set('furnished', parsedFilters.furnished);
            urlParams.set('offer', parsedFilters.offer);
            urlParams.set('sort', 'createdAt');
            urlParams.set('order', 'desc');

            if (parsedFilters.bedrooms && parsedFilters.bedrooms > 0) {
              urlParams.set('bedrooms', parsedFilters.bedrooms.toString());
            }
            if (parsedFilters.bathrooms && parsedFilters.bathrooms > 0) {
              urlParams.set('bathrooms', parsedFilters.bathrooms.toString());
            }

            const searchQuery = urlParams.toString();
            navigate(`/search?${searchQuery}`);
          }, 1000);

          // Auto-close modal after 3 seconds
          setTimeout(() => {
            setShowVoiceModal(false);
          }, 3000);
        }, 1000);
      };

      recognition.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setListening(false);
        setIsProcessing(false);
        setVoiceFeedback(`Error: ${event.error}. Please try again.`);

        setTimeout(() => {
          setShowVoiceModal(false);
        }, 2000);
      };

      recognition.current.onend = () => {
        setListening(false);
      };
    }
  }, [SpeechRecognition, navigate]);

  // Start voice search
  const startVoiceSearch = () => {
    if (recognition.current && !listening) {
      try {
        recognition.current.start();
      } catch (error) {
        console.error('Error starting voice recognition:', error);
      }
    }
  };

  // Stop voice search
  const stopVoiceSearch = () => {
    if (recognition.current && listening) {
      recognition.current.stop();
      setListening(false);
      setShowVoiceModal(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    const typeFromUrl = urlParams.get('type');
    const parkingFromUrl = urlParams.get('parking');
    const furnishedFromUrl = urlParams.get('furnished');
    const offerFromUrl = urlParams.get('offer');
    const bedroomsFromUrl = urlParams.get('bedrooms');
    const bathroomsFromUrl = urlParams.get('bathrooms');
    const sortFromUrl = urlParams.get('sort');
    const orderFromUrl = urlParams.get('order');

    if (
      searchTermFromUrl ||
      typeFromUrl ||
      parkingFromUrl ||
      furnishedFromUrl ||
      offerFromUrl ||
      bedroomsFromUrl ||
      bathroomsFromUrl ||
      sortFromUrl ||
      orderFromUrl
    ) {
      setSidebardata({
        searchTerm: searchTermFromUrl || '',
        type: typeFromUrl || 'all',
        parking: parkingFromUrl === 'true',
        furnished: furnishedFromUrl === 'true',
        offer: offerFromUrl === 'true',
        bedrooms: bedroomsFromUrl || '',
        bathrooms: bathroomsFromUrl || '',
        sort: sortFromUrl || 'createdAt',
        order: orderFromUrl || 'desc',
      });
    }

    const fetchListings = async () => {
      setLoading(true);
      setShowMore(false);
      const searchQuery = urlParams.toString();
      try {
        const res = await fetch(`/api/listing/get?${searchQuery}`);
        if (!res.ok) throw new Error('Failed to fetch listings');
        const data = await res.json();
        setListings(data);
        setLoading(false);
        setShowMore(data.length > 8);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchListings();
  }, [location.search]);

  const handleChange = (e) => {
    if (
      e.target.id === 'all' ||
      e.target.id === 'rent' ||
      e.target.id === 'sale'
    ) {
      setSidebardata({ ...sidebardata, type: e.target.id });
    }

    if (e.target.id === 'searchTerm') {
      setSidebardata({ ...sidebardata, searchTerm: e.target.value });
    }

    if (
      e.target.id === 'parking' ||
      e.target.id === 'furnished' ||
      e.target.id === 'offer'
    ) {
      setSidebardata({
        ...sidebardata,
        [e.target.id]: e.target.checked,
      });
    }

    if (e.target.id === 'bedrooms' || e.target.id === 'bathrooms') {
      setSidebardata({
        ...sidebardata,
        [e.target.id]: e.target.value,
      });
    }

    if (e.target.id === 'sort_order') {
      const [sort, order] = e.target.value.split('_');
      setSidebardata({ ...sidebardata, sort, order });
    }
  };

  const onShowMoreClick = async () => {
    const numberOfListings = listings.length;
    const startIndex = numberOfListings;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('startIndex', startIndex);
    const searchQuery = urlParams.toString();
    try {
      const res = await fetch(`/api/listing/get?${searchQuery}`);
      if (!res.ok) throw new Error('Failed to fetch listings');
      const data = await res.json();
      if (data.length < 9) {
        setShowMore(false);
      }
      setListings([...listings, ...data]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();
    urlParams.set('searchTerm', sidebardata.searchTerm);
    urlParams.set('type', sidebardata.type);
    urlParams.set('parking', sidebardata.parking);
    urlParams.set('furnished', sidebardata.furnished);
    urlParams.set('offer', sidebardata.offer);
    urlParams.set('sort', sidebardata.sort);
    urlParams.set('order', sidebardata.order);

    if (sidebardata.bedrooms && sidebardata.bedrooms !== '') {
      urlParams.set('bedrooms', sidebardata.bedrooms);
    }
    if (sidebardata.bathrooms && sidebardata.bathrooms !== '') {
      urlParams.set('bathrooms', sidebardata.bathrooms);
    }

    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  return (
    <div className="flex flex-col md:flex-row">
      {/* Voice Search Modal */}
      {showVoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mb-4">
                {listening ? (
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                      <span className="text-white text-2xl">🎤</span>
                    </div>
                  </div>
                ) : isProcessing ? (
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center animate-spin">
                      <span className="text-white text-2xl">⚙️</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-2xl">✓</span>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-lg font-semibold mb-2">
                {listening
                  ? 'Listening...'
                  : isProcessing
                  ? 'Processing...'
                  : 'Complete!'}
              </p>
              <p className="text-sm text-gray-600 mb-4">{voiceFeedback}</p>
              {listening && (
                <button
                  onClick={stopVoiceSearch}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Stop Listening
                </button>
              )}
              {!listening && !isProcessing && (
                <button
                  onClick={() => setShowVoiceModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="p-7 border-b-2 md:border-r-2 md:min-h-screen">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Enhanced Search Term with AI Voice Button */}
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap font-semibold">
              Search Term
            </label>
            <input
              type="text"
              id="searchTerm"
              value={sidebardata.searchTerm}
              onChange={handleChange}
              placeholder="Search bedrooms, parking, rent/sale..."
              className="border rounded-lg p-3 w-full"
            />
            {SpeechRecognition && (
              <button
                type="button"
                onClick={startVoiceSearch}
                disabled={listening}
                className={`ml-2 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  listening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg'
                }`}
                title="Try saying: 'Find 2 bedroom apartments for rent in downtown with parking'"
              >
                {listening ? '🔴 Listening...' : '🎤 AI Voice Search'}
              </button>
            )}
          </div>

          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="font-semibold">Bedrooms:</label>
              <select
                id="bedrooms"
                value={sidebardata.bedrooms}
                onChange={handleChange}
                className="border rounded-lg p-2"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="font-semibold">Bathrooms:</label>
              <select
                id="bathrooms"
                value={sidebardata.bathrooms}
                onChange={handleChange}
                className="border rounded-lg p-2"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>
          </div>

          {/* Quick Voice Commands Helper */}
          {SpeechRecognition && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">
                💡 Try voice commands like:
              </h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>"Show me 3 bedroom houses for sale with parking"</li>
                <li>"1 bedroom furnished rentals with special offers"</li>
              </ul>
            </div>
          )}

          {/* Type Selection */}
          <div className="flex gap-2 flex-wrap items-center">
            <label className="font-semibold">Type: </label>
            <div className="flex gap-2">
              <input
                id="all"
                type="checkbox"
                className="w-5"
                onChange={handleChange}
                checked={sidebardata.type === 'all'}
              />
              <span>Rent & Sale</span>
            </div>
            <div className="flex gap-2">
              <input
                id="rent"
                type="checkbox"
                className="w-5"
                onChange={handleChange}
                checked={sidebardata.type === 'rent'}
              />
              <span>Rent</span>
            </div>
            <div className="flex gap-2">
              <input
                id="sale"
                type="checkbox"
                className="w-5"
                onChange={handleChange}
                checked={sidebardata.type === 'sale'}
              />
              <span>Sale</span>
            </div>
            <div className="flex gap-2">
              <input
                id="offer"
                type="checkbox"
                className="w-5"
                onChange={handleChange}
                checked={sidebardata.offer}
              />
              <span>Offer</span>
            </div>
          </div>

          {/* Amenities */}
          <div className="flex gap-2 flex-wrap items-center">
            <label className="font-semibold">Amenities: </label>
            <div className="flex gap-2">
              <input
                id="parking"
                type="checkbox"
                className="w-5"
                onChange={handleChange}
                checked={sidebardata.parking}
              />
              <span>Parking</span>
            </div>
            <div className="flex gap-2">
              <input
                id="furnished"
                type="checkbox"
                className="w-5"
                onChange={handleChange}
                checked={sidebardata.furnished}
              />
              <span>Furnished</span>
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <label className="font-semibold">Sort: </label>
            <select
              onChange={handleChange}
              value={`${sidebardata.sort}_${sidebardata.order}`}
              className="border rounded-lg p-3"
              id="sort_order"
            >
              <option value="regularPrice_desc">Price: High to Low</option>
              <option value="regularPrice_asc">Price: Low to High</option>
              <option value="createdAt_desc">Latest</option>
              <option value="createdAt_asc">Oldest</option>
            </select>
          </div>

          <button className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95">
            Search
          </button>
        </form>
      </div>

      <div className="flex-1">
        <h1 className="text-3xl font-semibold border-b p-3 text-slate-700 mt-5">
          Listing Results
        </h1>
        <div className="flex p-7 flex-wrap gap-4">
          {!loading && listings.length === 0 && (
            <p className="text-xl text-slate-700 p-7">No listing found!</p>
          )}
          {loading && (
            <p className="text-xl text-slate-700 p-7 text-center w-full">
              Loading...
            </p>
          )}
          {!loading &&
            listings &&
            listings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}

          {showMore && (
            <button
              onClick={onShowMoreClick}
              className="text-green-700 hover:underline p-7 text-center w-full"
            >
              Show More
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
