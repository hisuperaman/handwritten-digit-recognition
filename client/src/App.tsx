import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

export default function App() {
  const [prediction, setPrediction] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const sigCanvas = useRef<SignatureCanvas>(null);

  const handlePredict = async () => {
    if (!sigCanvas.current) return
    setIsLoading(true)

    const dataURL = sigCanvas.current.toDataURL("image/png");
    const response = await fetch(`api/predict-digit/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ img: dataURL })
    })
    setIsLoading(false)
    if (!response.ok) {
      return
    }
    const data = await response.json();
    setPrediction(data.predicted_digit);
  };

  const handleClear = () => {
    sigCanvas.current?.clear()
    setPrediction(null)
  }

  return (
    <div className="min-h-screen bg-background text-white flex justify-center items-center flex-col gap-4">
      <h1 className="text-3xl font-bold mb-4">Draw a digit (0-9)</h1>
      <SignatureCanvas
        ref={sigCanvas}
        penColor="white"
        minWidth={5}
        maxWidth={5}
        backgroundColor="#212121"
        canvasProps={{ width: 300, height: 300, className: "sigCanvas" }}
      />

      <div className="flex gap-4">
        <button className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700 cursor-pointer active:scale-95 transition" onClick={handleClear}>
          Clear
        </button>
        <button className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 cursor-pointer flex items-center justify-center w-22 active:scale-95 transition" onClick={handlePredict}>
          {isLoading ? <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span> : 'Predict'}
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Prediction Result: {prediction!==null ? prediction : 'N/A'}</h2>
      </div>
    </div>
  )
}