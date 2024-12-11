import "./App.css";
import CameraCapture from "./components/CameraCapture.tsx"; // Import the CameraCapture component

function App() {
  return (
    <>
      <h2>Face Mask Detection</h2>
      <CameraCapture />
    </>
  );
}

export default App;
