import React, { useRef, useState } from 'react';

const CameraCapture: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Function to start the camera
  const startCamera = () => {
    if (videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setStream(stream);
          }
        })
        .catch((err) => console.log("Error accessing camera: ", err));
    }
  };

  // Function to stop the camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setStream(null);
    }
  };

  // Function to capture an image from the camera
  const captureImage = async () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Set canvas size to match video size
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        // Draw the current video frame on the canvas
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        // Convert canvas to image (Base64)
        const imageData = canvas.toDataURL("image/jpeg");

        // Send the image to Flask backend
        const response = await fetch("http://127.0.0.1:5000/predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image: imageData }),
        });

        const result = await response.json();
        setPrediction(result.prediction);

        // Clear the prediction after 5 seconds
        setTimeout(() => {
          setPrediction(null);
        }, 5000);
      }
    }
  };

  return (
    <div>
      <h2>Face Mask Detection</h2>
      <video ref={videoRef} autoPlay></video>
      <button onClick={startCamera}>Start Camera</button>
      <button onClick={stopCamera}>Stop Camera</button>
      <button onClick={captureImage}>Capture Image</button>

      {prediction && (
        <div>
          <p>Prediction: {prediction}</p>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;