// cloudinary.js
export const cloudinaryUpload = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'mern-real-estate'); // your unsigned preset name

  try {
    const res = await fetch(
      'https://api.cloudinary.com/v1_1/dm21jdklm/image/upload',
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await res.json();
    if (data.secure_url) {
      return data.secure_url;
    } else {
      throw new Error('Upload failed');
    }
  } catch (err) {
    console.error('Cloudinary Upload Error:', err);
    throw err;
  }
};
