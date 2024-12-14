import { useRef, useState, useEffect } from 'react';
import './Camera.css';

const messageDict = {
  incorrect_mask: "Please wear your mask properly!",
  with_mask: "Thank you for wearing a mask!",
  without_mask: "Please wear a mask!"
};

const Camera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [prediction, setPrediction] = useState<null>(null);

  const startCamera = () => {
    if (videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.log("Error accessing camera: ", err));
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const captureFrame = async () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (ctx) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL("image/jpeg");

        const response = await fetch("http://127.0.0.1:5000/predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image: imageData }),
        });

        const result = await response.json();
        setPrediction(result.prediction);
      }
    }
  };

  useEffect(() => {
    startCamera();
    const intervalId = setInterval(captureFrame, 500);

    return () => {
      clearInterval(intervalId);
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

export default Camera;