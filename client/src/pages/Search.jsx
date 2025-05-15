import { React, useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ListingCard from '../components/ListingCard';

export default function Search() {
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebardata, setSidebardata] = useState({
    searchTerm: '',
    type: 'all',
    parking: false,
    furnished: false,
    offer: false,
    sort: 'createdAt', // unified key naming
    order: 'desc',
  });

  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [listening, setListening] = useState(false);

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition || null;

  const recognition = useRef(null);

  useEffect(() => {
    // Initialize speech recognition
    if (SpeechRecognition && !recognition.current) {
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;

      recognition.current.onresult = (event) => {
        console.log('event.results[0][0]', event.results[0][0])
        const speechResult = event.results[0][0].transcript;
        setSidebardata((prev) => ({ ...prev, searchTerm: speechResult }));
        setListening(false);
      };

      recognition.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setListening(false);
      };

      recognition.current.onend = () => {
        setListening(false);
      };
    }
  }, [SpeechRecognition]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    const typeFromUrl = urlParams.get('type');
    const parkingFromUrl = urlParams.get('parking');
    const furnishedFromUrl = urlParams.get('furnished');
    const offerFromUrl = urlParams.get('offer');
    const sortFromUrl = urlParams.get('sort');
    const orderFromUrl = urlParams.get('order');

    if (
      searchTermFromUrl ||
      typeFromUrl ||
      parkingFromUrl ||
      furnishedFromUrl ||
      offerFromUrl ||
      sortFromUrl ||
      orderFromUrl
    ) {
      setSidebardata({
        searchTerm: searchTermFromUrl || '',
        type: typeFromUrl || 'all',
        parking: parkingFromUrl === 'true',
        furnished: furnishedFromUrl === 'true',
        offer: offerFromUrl === 'true',
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

    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  return (
    <div className="flex flex-col md:flex-row">
      <div className="p-7 border-b-2 md:border-r-2 md:min-h-screen">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Search Term with Mic button */}
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap font-semibold">
              Search Term
            </label>
            <input
              type="text"
              id="searchTerm"
              value={sidebardata.searchTerm}
              onChange={handleChange}
              placeholder="Search..."
              className="border rounded-lg p-3 w-full"
            />
            {SpeechRecognition && (
              <button
                type="button"
                onClick={() => {
                  if (listening) {
                    recognition.current.stop();
                  } else {
                    recognition.current.start();
                    setListening(true);
                  }
                }}
                className={`ml-2 px-3 py-2 bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95${
                  listening ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                }`}
                aria-label="Toggle voice search"
              >
                {listening ? 'Listening...' : '🎤 Speak'}
              </button>
            )}
          </div>

          {/* Type (consider changing to radios if you want single select) */}
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
