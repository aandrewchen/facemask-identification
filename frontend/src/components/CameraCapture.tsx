import React, { useRef, useState, useEffect } from 'react';
import './CameraCapture.css'; // Import the CSS file

const messageDict = {
  incorrect_mask: "Please wear your mask properly!",
  with_mask: "Thank you for wearing a mask!",
  without_mask: "Please wear a mask!"
};

type PredictionType = keyof typeof messageDict;

const CameraCapture: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [prediction, setPrediction] = useState<PredictionType | null>(null);
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

  // Function to capture a frame from the camera
  const captureFrame = async () => {
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
        setPrediction(result.prediction as PredictionType);
      }
    }
  };

  // Start the camera and set interval to capture frames every 1 second
  useEffect(() => {
    startCamera();
    const intervalId = setInterval(captureFrame, 500); // Capture frame every 1 second

    return () => {
      clearInterval(intervalId); // Clear interval when component unmounts
      stopCamera();
    };
  }, []);

  return (
    <div>
      <div className="camera-container">
        <video ref={videoRef} autoPlay className="rounded-video"></video>
      </div>

      {prediction && (
        <div className="prediction-container">
          <p>{messageDict[prediction]}</p>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;