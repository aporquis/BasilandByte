import { useState } from 'react';
import axios from 'axios';

const UploadImage = ({ onUploadSuccess }) => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const cloudName = process.env.REACT_APP_CLOUD_NAME;
  const uploadPreset = process.env.REACT_APP_UPLOAD_PRESET;

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    setPreviewUrl(URL.createObjectURL(e.target.files[0]));
  };

  const handleUpload = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append('file', image);
    formData.append('upload_preset', uploadPreset); //preset name

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData
      );
      console.log(res.data.secure_url);
      onUploadSuccess(res.data.secure_url); // send URL back to parent or form
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  return (
    <div>
    <input type="file" accept="image/*" onChange={handleImageChange} />
    {previewUrl && (
      <div style={{ marginTop: "10px" }}>
        <img src={previewUrl} alt="Preview" style={{ width: "200px" }} />
      </div>
    )}
    <button type="button" onClick={handleUpload} disabled={!image}>
      Upload Image
    </button>
  </div>
);
};

export default UploadImage;