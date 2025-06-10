import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import SwiperCore from 'swiper';
import 'swiper/css/bundle';
import ListingCard from '../components/ListingCard';

export default function Home() {
  const [offerListings, setofferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);
  SwiperCore.use([Navigation]);

  useEffect(() => {
    const fetchListingsSequentially = async () => {
      try {
        const offerRes = await fetch('/api/listing/get?offer=true&limit=4');
        const offerData = await offerRes.json();
        setofferListings(offerData);

        const rentRes = await fetch('/api/listing/get?type=rent&limit=4');
        const rentData = await rentRes.json();
        setRentListings(rentData);

        const saleRes = await fetch('/api/listing/get?type=sale&limit=4');
        const saleData = await saleRes.json();
        setSaleListings(saleData);
      } catch (error) {
        console.log('Error fetching listings:', error);
      }
    };

    fetchListingsSequentially();
  }, []);

  return (
    <div>
      {/* {top} */}
      <div className="flex flex-col gap-6 p-28 px-3 max-w-6xl mx-auto">
        <h1 className="text-slate-700 font-bold text-3xl lg:text-6xl">
          {' '}
          Where Your Next <span className="text-slate-500">
            Chapter
          </span> Begins <br></br>
          Discover Homes That Match Your Story.
        </h1>
        <div className="text-gray-400 text-xs sm:text-sm">
          Explore tailored property listings for rent and sale, designed to fit
          your lifestyle, location, and budget.
          <br />
          all in one smart, seamless platform.
        </div>
        <Link
          className="text-xs sm:text-sm text-blue-800 font-bold hover:underline"
          to={'/search'}
        >
          {' '}
          Let's get started...
        </Link>
      </div>

      {/* {Swiper} */}
      <Swiper navigation>
        {offerListings &&
          offerListings.length > 0 &&
          offerListings.map((listing) => (
            <SwiperSlide>
              <div
                style={{
                  background: `url(${listing.imageUrls[0]}) center no-repeat`,
                  backgroundSize: 'cover',
                }}
                className="h-[500px]"
                key={listing._id}
              ></div>
            </SwiperSlide>
          ))}
      </Swiper>

      {/* {listings results for offer , sale and rent} */}
      <div className="max-w-6xl mx-auto p-3 flex flex-col gap-8 my-10">
        {offerListings && offerListings.length > 0 && (
          <div className="div">
            <div className="my-3">
              <h2 className="text-2xl font-semibold text-slate-600">
                Recent offers
              </h2>
              <Link
                className="text-sm text-blue-800 hover:underline"
                to={'/search?offer=true'}
              >
                Show more offers
              </Link>
              <div className="flex flex-wrap gap-4">
                {offerListings?.map((listing) => (
                  <ListingCard
                    listing={listing}
                    key={listing._id}
                  ></ListingCard>
                ))}
              </div>
            </div>
          </div>
        )}
        {rentListings && rentListings.length > 0 && (
          <div className="div">
            <div className="my-3">
              <h2 className="text-2xl font-semibold text-slate-600">
                Recent places for rent
              </h2>
              <Link
                className="text-sm text-blue-800 hover:underline"
                to={'/search?type=rent'}
              >
                Show more places for rent
              </Link>
              <div className="flex flex-wrap gap-4">
                {rentListings?.map((listing) => (
                  <ListingCard
                    listing={listing}
                    key={listing._id}
                  ></ListingCard>
                ))}
              </div>
            </div>
          </div>
        )}
        {saleListings && saleListings.length > 0 && (
          <div className="div">
            <div className="my-3">
              <h2 className="text-2xl font-semibold text-slate-600">
                Recent places for sale
              </h2>
              <Link
                className="text-sm text-blue-800 hover:underline"
                to={'/search?type=sale'}
              >
                Show more places for sale
              </Link>
              <div className="flex flex-wrap gap-4">
                {saleListings?.map((listing) => (
                  <ListingCard
                    listing={listing}
                    key={listing._id}
                  ></ListingCard>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
