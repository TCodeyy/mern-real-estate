import { React, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ImagePreviewList from '../components/ImagePreviewsList';
import { cloudinaryUpload } from '../cloudinary';
export default function CreateListing() {
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: '',
    description: '',
    address: '',
    type: 'rent',
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });

  const [imageUploadError, setImageUploadError] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { currentUser } = useSelector((state) => state.user);

  const navigate = useNavigate();
  const handleImageSubmit = async () => {
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      setUploading(true);
      setImageUploadError(false);
      const promises = [];
      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }

      try {
        const imageUrls = await Promise.all(promises);
        setFormData((prev) => ({
          ...prev,
          imageUrls: [...prev.imageUrls, ...imageUrls],
        }));
        setImageUploadError(false);
        setUploading(false);

        setFiles([]); // reset file input
      } catch (error) {
        setImageUploadError('Image upload failed (2 MB max per image)');
      }
    } else {
      setImageUploadError('You can only upload 6 images per listing !');
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const storeImage = async (file) => {
    try {
      const url = await cloudinaryUpload(file);
      return url;
    } catch (error) {
      throw new Error('Image upload failed. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { id, type, value, checked } = e.target;

    if (id === 'sale' || id === 'rent') {
      return setFormData((prev) => ({ ...prev, type: id }));
    }

    if (['parking', 'furnished'].includes(id)) {
      return setFormData((prev) => ({ ...prev, [id]: checked }));
    }

    if (id === 'offer') {
      return setFormData((prev) => ({
        ...prev,
        offer: checked,
        discountPrice: checked ? prev.discountPrice : 0, // reset to 0 when unchecked
      }));
    }

    if (type === 'number') {
      return setFormData((prev) => ({
        ...prev,
        [id]: value === '' ? 0 : Number(value),
      }));
    }

    return setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (+formData.regularPrice < +formData.discountPrice)
        return setError('Discount price must be lower than regular price');
      setLoading(true);
      setError(false);
      const res = await fetch('/api/listing/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, userRef: currentUser._id }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success === false) {
        setError(data.message);
      }
      navigate(`/listing/${data._id}`);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center m-7">
        Create a listing
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            placeholder="Name"
            className="p-3 bg-white rounded-lg"
            id="name"
            maxLength="62"
            minLength="10"
            required
            onChange={handleChange}
            value={formData.name}
          ></input>
          <textarea
            type="text"
            placeholder="Description"
            className="bg-white
             p-3 rounded-lg"
            id="description"
            required
            onChange={handleChange}
            value={formData.description}
          ></textarea>
          <input
            type="text"
            placeholder="Address"
            className="bg-white p-3 rounded-lg"
            id="address"
            required
            onChange={handleChange}
            value={formData.address}
          ></input>
          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="sale"
                className="w-5"
                onChange={handleChange}
                checked={formData.type === 'sale'}
              />
              <span> Sell</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="rent"
                className="w-5"
                onChange={handleChange}
                checked={formData.type === 'rent'}
              />
              <span> Rent</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="parking"
                className="w-5"
                onChange={handleChange}
                checked={formData.parking}
              />
              <span>Parking Spot</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="furnished"
                className="w-5"
                onChange={handleChange}
                checked={formData.furnished}
              />
              <span>Furnished</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="offer"
                className="w-5"
                onChange={handleChange}
                checked={formData.offer}
              />
              <span>Offer</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <input
                className="p-3 border border-gray-300 rounded-lg"
                type="number"
                id="bedrooms"
                min="1"
                max="10"
                required
                onChange={handleChange}
                value={formData.bedrooms}
              />
              <p>Beds</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                className="p-3 border border-gray-300 rounded-lg"
                type="number"
                id="bathrooms"
                min="1"
                max="10"
                required
                onChange={handleChange}
                value={formData.bathrooms}
              />
              <p>Baths</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                className="p-3 border border-gray-300 rounded-lg "
                type="number"
                id="regularPrice"
                min="50"
                max="1000000"
                required
                onChange={handleChange}
                value={formData.regularPrice}
              />
              <div className="flex flex-col items-center">
                <p>Regular Price</p>
                {formData.type === 'rent' && (
                  <span className="text-xs"> ( $ / month)</span>
                )}
              </div>
            </div>
            {formData.offer && (
              <div className="flex items-center gap-2">
                <input
                  className="p-3 border border-gray-300 rounded-lg"
                  type="number"
                  id="discountPrice"
                  min="0"
                  max="100000"
                  required
                  onChange={handleChange}
                  value={formData.discountPrice}
                />

                <div className="flex flex-col items-center">
                  <p>Discounted Price</p>
                  {formData.type === 'rent' && (
                    <span className="text-xs"> ( $ / month)</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">
            {' '}
            Images:
            <span className="font-normal text-gray-6000 ml-2">
              First image will be the cover (max 6)
            </span>{' '}
          </p>
          <div className="flex gap-4">
            <input
              onChange={(e) => setFiles(e.target.files)}
              className="p-3 border border-gray-300 rounded w-full"
              type="file"
              id="images"
              accept="image/*"
              multiple
            />
            <button
              type="button"
              disabled={uploading}
              onClick={handleImageSubmit}
              className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          <ImagePreviewList
            imageUrls={formData.imageUrls}
            onRemove={handleRemoveImage}
          />
          <button
            disabled={loading}
            className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled::opacity:80"
          >
            {loading ? 'Creating...' : 'Create Listing'}
          </button>
          <p className="text-red-700">{imageUploadError && imageUploadError}</p>
          {error && <p className="text-red-700 text-sm">{error}</p>}
        </div>
      </form>
    </main>
  );
}
