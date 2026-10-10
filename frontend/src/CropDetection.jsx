import { useEffect, useRef, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

async function inspectImageQuality(file, imageUrl) {
  const image = new Image();
  image.src = imageUrl;
  await image.decode();

  const canvas = document.createElement("canvas");
  const sampleSize = 64;
  canvas.width = sampleSize;
  canvas.height = sampleSize;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Image quality check is unavailable in this browser.");
  context.drawImage(image, 0, 0, sampleSize, sampleSize);
  const pixels = context.getImageData(0, 0, sampleSize, sampleSize).data;
  const luminance = new Float32Array(sampleSize * sampleSize);
  let brightness = 0;

  for (let index = 0; index < luminance.length; index += 1) {
    const offset = index * 4;
    const value = 0.2126 * pixels[offset] + 0.7152 * pixels[offset + 1] + 0.0722 * pixels[offset + 2];
    luminance[index] = value;
    brightness += value;
  }

  brightness /= luminance.length;
  const variance = luminance.reduce((total, value) => total + (value - brightness) ** 2, 0) / luminance.length;
  let edgeDifference = 0;
  let edgeCount = 0;
  for (let y = 1; y < sampleSize; y += 1) {
    for (let x = 1; x < sampleSize; x += 1) {
      const index = y * sampleSize + x;
      edgeDifference += Math.abs(luminance[index] - luminance[index - 1]);
      edgeDifference += Math.abs(luminance[index] - luminance[index - sampleSize]);
      edgeCount += 2;
    }
  }

  const sharpness = edgeDifference / edgeCount;
  const warnings = [];
  if (image.naturalWidth < 320 || image.naturalHeight < 320) warnings.push("Low resolution may hide small leaf details.");
  if (brightness < 48) warnings.push("Image looks dark. Retake it in brighter, even light.");
  if (brightness > 220) warnings.push("Image looks overexposed. Reduce direct glare and retake it.");
  if (Math.sqrt(variance) < 20) warnings.push("Low contrast detected. Place the leaf against a plain background.");
  if (sharpness < 3.2) warnings.push("The image may be out of focus. Hold the camera steady and retake it.");

  return {
    width: image.naturalWidth,
    height: image.naturalHeight,
    size: file.size,
    warnings,
  };
}

function CropDetection({ farmer }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [quality, setQuality] = useState(null);
  const [checkingQuality, setCheckingQuality] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const farmerId =
    farmer?.id ||
    farmer?.farmer_id ||
    farmer?.user_id ||
    1;

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  useEffect(() => {
    if (!scannerOpen) return undefined;

    let cancelled = false;
    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera access is unavailable. Open this page on localhost or over HTTPS.");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: "environment" } },
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraError("");
      } catch (cameraFailure) {
        if (!cancelled) {
          setCameraError(cameraFailure.message || "Could not open the camera. Check browser camera permissions.");
        }
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [scannerOpen]);

  const handleSelectedFile = async (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.size) {
      setError("The selected image is empty. Choose a JPG or PNG image.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("Choose an image smaller than 10 MB.");
      return;
    }

    const supportedMimeType = /^image\/(jpeg|png)$/i.test(selectedFile.type);
    const supportedExtension = /\.(jpe?g|png)$/i.test(selectedFile.name);
    if (!supportedMimeType || !supportedExtension) {
      setError("Supported image formats are JPG, JPEG, and PNG.");
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    setFile(selectedFile);
    setResult(null);
    setError("");
    setQuality(null);

    const imageUrl = URL.createObjectURL(selectedFile);
    setPreview(imageUrl);
    setCheckingQuality(true);

    try {
      const qualityResult = await inspectImageQuality(selectedFile, imageUrl);
      if (qualityResult.width < 160 || qualityResult.height < 160) {
        throw new Error("This image is too small to analyze. Choose a clearer image at least 160 × 160 pixels.");
      }
      if (qualityResult.warnings.some((warning) => warning.includes("out of focus"))) {
        throw new Error("This image appears out of focus. Retake it with the leaf sharp and in focus.");
      }
      setQuality(qualityResult);
    } catch (qualityError) {
      setError(qualityError.message || "Could not read this image. Choose a different file.");
      setFile(null);
      setPreview(null);
      URL.revokeObjectURL(imageUrl);
    } finally {
      setCheckingQuality(false);
    }
  };

  const handleFileChange = async (event) => {
    await handleSelectedFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setCameraError("Camera is not ready yet. Wait for the preview, then try again.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      setCameraError("Could not capture this frame. Please try again.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) {
        setCameraError("Could not create an image from this camera frame.");
        return;
      }

      const capturedImage = new File([blob], `crop-scan-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      setScannerOpen(false);
      void handleSelectedFile(capturedImage);
    }, "image/jpeg", 0.92);
  };

  const handleAnalyze = async () => {
    if (!file || checkingQuality) {
      setError("Please select a crop leaf image first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();

      formData.append("farmer_id", String(farmerId));
      formData.append("file", file);

      const response = await fetch(
        `${API_BASE}/detection/analyze`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const detail = data?.detail;
        throw new Error(
          typeof detail === "string"
            ? detail
            : "Unable to analyze the image. The backend returned an unreadable response."
        );
      }

      if (!data.success) {
        throw new Error("AI analysis was not successful.");
      }

      setResult(data);

      try {
        const historyResponse = await fetch(
          `${API_BASE}/detection/history/${farmerId}`
        );
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          setHistory(historyData.history || []);
        }
      } catch {
        setHistory([]);
      }
    } catch (err) {
      console.error("Crop detection error:", err);

      setError(
        err instanceof TypeError && err.message === "Failed to fetch"
          ? `The AI service at ${API_BASE} could not be reached. Make sure the Farm AI backend is running and try again.`
          : err.message || "Unable to connect to the Farm AI Advisory backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangeImage = () => {
    setScannerOpen(false);
    setFile(null);
    setPreview(null);
    setResult(null);
    setError("");
    setHistory([]);
    setQuality(null);
  };

  const getConfidenceClass = (level) => {
    if (level === "High") return "high";
    if (level === "Medium") return "medium";
    return "low";
  };

  const previousMatches = history.filter(
    (item) =>
      item.id !== result?.detection_id &&
      item.crop_type === result?.crop_type &&
      item.disease === result?.disease
  );

  return (
    <div className="crop-detection-page">

      {/* Header */}
      <div className="detection-header">
        <span className="detection-kicker">FIELD HEALTH WORKSPACE</span>
        <h1>Crop health assessment</h1>

        <p>
          Start with one clear leaf image. Review the model's likely match and verify it in the field.
        </p>
      </div>

      {/* Upload Section */}
      {!result && (
        <div className="detection-card">

          {!preview ? (
            <>
              <label className="upload-box">
                <div className="upload-icon" aria-hidden="true">+</div>

                <h3>Choose a crop image</h3>

                <p>
                  JPG, JPEG, or PNG · Up to 10 MB
                </p>

                <span className="upload-button">
                  Browse images
                </span>

                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleFileChange}
                  disabled={checkingQuality || scannerOpen}
                  hidden
                />
              </label>
              <button
                type="button"
                className="scanner-open-button"
                onClick={() => {
                  setCameraError("");
                  setScannerOpen(true);
                }}
                disabled={scannerOpen || checkingQuality}
              >
                Open camera scanner
              </button>
              {scannerOpen && (
                <div className="scanner-panel">
                  {cameraError ? (
                    <p className="scanner-error" role="alert">{cameraError}</p>
                  ) : (
                    <video ref={videoRef} className="scanner-video" autoPlay playsInline muted />
                  )}
                  <div className="scanner-controls">
                    <span>Frame a single leaf in even light.</span>
                    <button type="button" onClick={handleCapture} disabled={Boolean(cameraError)}>Capture leaf</button>
                    <button type="button" onClick={() => setScannerOpen(false)}>Cancel</button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="image-preview-container">
                <img
                  src={preview}
                  alt="Selected crop"
                  className="crop-preview"
                />

                <div className="file-info">
                  <div>
                    <strong>{file?.name}</strong>

                    <span>
                      {file
                        ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                        : ""}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="change-image-button"
                    onClick={handleChangeImage}
                    disabled={loading}
                  >
                    Change Image
                  </button>
                </div>
              </div>

              {checkingQuality && <div className="quality-checking" role="status">Checking image clarity and lighting...</div>}

              {quality && !checkingQuality && (
                <div className={`image-quality ${quality.warnings.length ? "attention" : "ready"}`} role="status">
                  <div><strong>{quality.warnings.length ? "Review image quality" : "Image is ready for screening"}</strong><span>{quality.width} × {quality.height} px · {(quality.size / 1024 / 1024).toFixed(2)} MB</span></div>
                  {quality.warnings.length > 0 && <ul>{quality.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>}
                </div>
              )}

              <button
                type="button"
                className="analyze-button"
                onClick={handleAnalyze}
                disabled={loading || checkingQuality || !quality}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Analyzing Image...
                  </>
                ) : (
                  <>
                    Analyze image
                  </>
                )}
              </button>

              {loading && (
                <p className="loading-message">
                  Comparing the image with supported crop classes...
                </p>
              )}
            </>
          )}

          {/* Error */}
          {error && (
            <div className="error-box">
              <strong>⚠️ Analysis Error</strong>
              <p>{error}</p>

              <button
                type="button"
                onClick={() => setError("")}
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="result-section">

          <div className="result-header">
            <div>
              <span className="detection-kicker">ANALYSIS COMPLETE</span>
              <h2>Image screening result</h2>
              <p>
                One likely class from the trained crop-disease model.
              </p>
            </div>

            <button
              type="button"
              className="new-analysis-button"
              onClick={handleChangeImage}
            >
              New scan
            </button>
          </div>

          {/* Main Result Cards */}
          <div className="result-grid">

            <div className="result-card">
              <span>Crop Type</span>
              <strong>
                {result.crop_type || "Unknown"}
              </strong>
            </div>

            <div className="result-card">
              <span>Detected Condition</span>
              <strong>
                {result.disease_label || result.disease || "Unknown"}
              </strong>
            </div>

            <div className="result-card">
              <span>Confidence</span>
              <strong>
                {result.confidence_percent ?? result.confidence ?? 0}%
              </strong>

              <small
                className={`confidence ${getConfidenceClass(
                  result.confidence_level
                )}`}
              >
                {result.confidence_level || "Unrated"} model score
              </small>
            </div>

            <div className="result-card">
              <span>Severity</span>
              <strong>
                {result.severity || "Not assessed"}
              </strong>
            </div>

          </div>

          <div className="model-note">
            Confidence describes how strongly this model favored a class. It is not a probability of crop loss or a measure of disease severity.
          </div>
          {Array.isArray(result.supported_crops) && (
            <div className="model-note">
              Trained crops: {result.supported_crops.join(", ")}. Images of other crops are outside the model's supported classes and may receive an incorrect label.
            </div>
          )}

          {/* Warning */}
          {result.warning && (
            <div className="warning-box">
              <strong>Before you act</strong>
              <span>{result.warning}</span>
            </div>
          )}

          {/* Recommendation */}
          <div className="recommendation-card">
            <span className="section-kicker">NEXT STEPS</span>
            <h3>Field guidance</h3>

            <p>
              {result.recommendation ||
                "No recommendation available."}
            </p>
          </div>

          {result.advisory && (
            <section className="recommendation-card disease-advisory" aria-label="Disease explanation and management">
              <span className="section-kicker">DISEASE ADVISORY</span>
              <h3>What this result may mean</h3>
              <dl>
                <div><dt>Symptoms</dt><dd>{result.advisory.symptoms}</dd></div>
                <div><dt>Possible causes</dt><dd>{result.advisory.possible_causes}</dd></div>
                <div><dt>Plant impact</dt><dd>{result.advisory.plant_impact}</dd></div>
                <div><dt>Do now</dt><dd>{result.advisory.immediate_actions}</dd></div>
                <div><dt>Treatment and management</dt><dd>{result.advisory.treatment}</dd></div>
                <div><dt>Prevention</dt><dd>{result.advisory.prevention}</dd></div>
                <div><dt>Recovery</dt><dd>{result.advisory.recovery}</dd></div>
              </dl>
            </section>
          )}

          {/* Top Predictions */}
          {Array.isArray(result.top_predictions) &&
            result.top_predictions.length > 0 && (
              <div className="predictions-card">
                <span className="section-kicker">MODEL RANKING</span>
                <h3>Other likely classes</h3>
                <p className="section-description">Alternatives from a single-label classifier; these are not additional confirmed diseases.</p>

                {result.top_predictions.map(
                  (prediction, index) => (
                    <div
                      className="prediction-row"
                      key={index}
                    >
                      <div className="prediction-name">
                        <span>
                          #{index + 1}
                        </span>

                        <strong>
                          {prediction.label.replace(/\s+/g, " ").trim()}
                        </strong>
                      </div>

                      <div className="prediction-score">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${Math.min(
                                prediction.confidence_percent ||
                                  0,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>

                        <span>
                          {prediction.confidence_percent ??
                            0}
                          %
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

          <section className="tracking-card" aria-labelledby="tracking-title">
            <div className="tracking-heading">
              <div>
                <span className="section-kicker">PERSONAL RECORD</span>
                <h3 id="tracking-title">Repeat observations</h3>
              </div>
              <span className="tracking-count">{previousMatches.length} earlier match{previousMatches.length === 1 ? "" : "es"}</span>
            </div>
            {previousMatches.length > 0 ? (
              <>
                <p className="section-description">The same class appeared in earlier scans. Compare the plants directly; image-class confidence does not measure disease progression.</p>
                <ol className="tracking-list">
                  {previousMatches.slice(0, 4).map((item) => (
                    <li key={item.id}>
                      <span className="tracking-dot" />
                      <span>{item.created_at ? new Date(`${item.created_at}Z`).toLocaleString() : "Previous scan"}</span>
                      <strong>{Number(item.confidence || 0).toFixed(1)}% model score</strong>
                    </li>
                  ))}
                </ol>
              </>
            ) : (
              <p className="section-description">This is the first saved scan with this crop and result. Repeat scans create a dated observation record.</p>
            )}
          </section>

          <section className="capability-card" aria-labelledby="capability-title">
            <span className="section-kicker">MODEL COVERAGE</span>
            <h3 id="capability-title">What this scan can assess</h3>
            <div className="capability-grid">
              <div><span>Crop type identification</span><strong className="capability-supported">Supported</strong></div>
              <div><span>Healthy vs. diseased class</span><strong className="capability-supported">Supported</strong></div>
              <div><span>Confidence and ranked alternatives</span><strong className="capability-supported">Supported</strong></div>
              <div><span>Pest detection</span><strong>Needs a pest model</strong></div>
              <div><span>Weed detection</span><strong>Needs a weed model</strong></div>
              <div><span>Nutrient deficiency</span><strong>Needs a trained model</strong></div>
              <div><span>Multiple conditions in one image</span><strong>Not supported by this classifier</strong></div>
              <div><span>Severity analysis</span><strong>Requires field assessment</strong></div>
              <div><span>Progress tracking</span><strong className="capability-supported">Dated repeat scans</strong></div>
              <div><span>Disease-spread alerts</span><strong>Needs regional reports</strong></div>
            </div>
          </section>

          {/* Verification */}
          <div className="verification-box">
            <h3>Verification</h3>

            <p>
              This is an image-based screening result, not a laboratory diagnosis. Confirm symptoms with a local agricultural extension officer before applying crop treatments. Use only locally registered products and follow their labels.
            </p>
          </div>

        </div>
      )}

      <style>{`
        .crop-detection-page {
          max-width: 1000px;
          margin: 0 auto;
          padding: 30px 20px 60px;
          font-family: Arial, sans-serif;
        }

        .detection-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .plant-icon {
          font-size: 42px;
          margin-bottom: 8px;
        }

        .detection-header h1 {
          margin: 0;
          font-size: 32px;
          color: #164e3d;
        }

        .detection-header p {
          color: #718096;
          font-size: 16px;
          margin-top: 10px;
        }

        .detection-card {
          background: white;
          border-radius: 20px;
          padding: 25px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.08);
        }

        .upload-box {
          min-height: 280px;
          border: 2px dashed #9cc7b6;
          border-radius: 18px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          background: #f7fbf9;
        }

        .upload-icon {
          font-size: 50px;
        }

        .upload-box h3 {
          color: #164e3d;
          margin: 12px 0 5px;
        }

        .upload-box p {
          color: #718096;
        }

        .upload-button {
          background: #16734f;
          color: white;
          padding: 12px 25px;
          border-radius: 10px;
          margin-top: 10px;
          font-weight: bold;
        }

        .image-preview-container {
          border: 1px solid #d8e5df;
          border-radius: 18px;
          overflow: hidden;
        }

        .crop-preview {
          width: 100%;
          max-height: 500px;
          object-fit: contain;
          display: block;
          background: #f5f7f6;
        }

        .file-info {
          padding: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          background: #f8fbf9;
        }

        .file-info div {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .file-info span {
          color: #718096;
          font-size: 13px;
        }

        .change-image-button {
          padding: 10px 18px;
          border: 1px solid #16734f;
          border-radius: 10px;
          background: white;
          color: #16734f;
          cursor: pointer;
          font-weight: bold;
        }

        .analyze-button {
          width: 100%;
          margin-top: 20px;
          padding: 16px;
          border: none;
          border-radius: 12px;
          background: #16734f;
          color: white;
          font-size: 17px;
          font-weight: bold;
          cursor: pointer;
        }

        .analyze-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 3px solid rgba(255,255,255,0.4);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .loading-message {
          text-align: center;
          color: #718096;
          margin-top: 12px;
        }

        .error-box {
          margin-top: 20px;
          padding: 16px;
          border-radius: 12px;
          background: #fff1f1;
          border: 1px solid #f1b5b5;
          color: #8a2525;
        }

        .error-box p {
          margin: 8px 0;
        }

        .error-box button {
          border: none;
          background: #8a2525;
          color: white;
          padding: 7px 15px;
          border-radius: 7px;
          cursor: pointer;
        }

        .result-section {
          margin-top: 25px;
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .result-header h2 {
          color: #164e3d;
          margin: 0;
        }

        .result-header p {
          color: #718096;
        }

        .new-analysis-button {
          border: none;
          background: #16734f;
          color: white;
          padding: 11px 18px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: bold;
        }

        .result-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }

        .result-card {
          background: white;
          padding: 20px;
          border-radius: 15px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.07);
        }

        .result-card span {
          display: block;
          color: #718096;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .result-card strong {
          display: block;
          color: #164e3d;
          font-size: 20px;
        }

        .confidence {
          margin-top: 8px;
          font-size: 13px;
          font-weight: bold;
        }

        .confidence.high {
          color: #178044;
        }

        .confidence.medium {
          color: #a06a00;
        }

        .confidence.low {
          color: #a52c2c;
        }

        .warning-box {
          margin-top: 20px;
          padding: 15px;
          border-radius: 12px;
          background: #fff8e5;
          border: 1px solid #ead38b;
          color: #745700;
        }

        .recommendation-card,
        .predictions-card,
        .verification-box {
          margin-top: 20px;
          background: white;
          padding: 22px;
          border-radius: 15px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.07);
        }

        .recommendation-card h3,
        .predictions-card h3,
        .verification-box h3 {
          margin-top: 0;
          color: #164e3d;
        }

        .recommendation-card p,
        .verification-box p {
          line-height: 1.7;
          color: #4a5568;
        }

        .prediction-row {
          padding: 13px 0;
          border-bottom: 1px solid #edf2ef;
        }

        .prediction-row:last-child {
          border-bottom: none;
        }

        .prediction-name {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .prediction-name span {
          background: #e7f3ed;
          color: #16734f;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: bold;
        }

        .prediction-name strong {
          color: #2d3748;
        }

        .prediction-score {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .progress-bar {
          flex: 1;
          height: 8px;
          background: #e7ece9;
          border-radius: 10px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #16734f;
          border-radius: 10px;
        }

        .prediction-score > span {
          width: 55px;
          text-align: right;
          color: #4a5568;
          font-weight: bold;
          font-size: 13px;
        }

        .verification-box {
          background: #f5faf7;
          border: 1px solid #d8e8df;
        }

        @media (max-width: 750px) {
          .result-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .result-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 500px) {
          .result-grid {
            grid-template-columns: 1fr;
          }

          .file-info {
            flex-direction: column;
            align-items: flex-start;
          }

          .change-image-button {
            width: 100%;
          }
        }
        .crop-detection-page {
          --scan-green: #1d6548;
          --scan-ink: #203b30;
          --scan-muted: #687b71;
          --scan-line: #dce6df;
          max-width: 1120px;
          padding: 22px 18px 48px;
          color: var(--scan-ink);
          font-family: inherit;
        }

        .detection-header {
          padding: 0 0 20px;
          margin-bottom: 22px;
          border-bottom: 1px solid var(--scan-line);
          text-align: left;
        }

        .detection-kicker,
        .section-kicker {
          display: block;
          color: var(--scan-green);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .detection-header h1 {
          margin: 7px 0 0;
          color: var(--scan-ink);
          font-size: 27px;
          line-height: 1.2;
        }

        .detection-header p {
          max-width: 680px;
          margin: 8px 0 0;
          color: var(--scan-muted);
          font-size: 14px;
          line-height: 1.6;
        }

        .detection-card,
        .result-card,
        .recommendation-card,
        .predictions-card,
        .verification-box,
        .tracking-card,
        .capability-card {
          border: 1px solid var(--scan-line);
          border-radius: 6px;
          box-shadow: none;
        }

        .detection-card {
          padding: clamp(16px, 3vw, 26px);
        }

        .upload-box {
          min-height: 250px;
          border: 1px dashed #8ba999;
          border-radius: 6px;
          background: #f5f8f5;
          transition: border-color 150ms ease, background 150ms ease;
        }

        .upload-box:hover,
        .upload-box:focus-within {
          border-color: var(--scan-green);
          background: #eff6f1;
        }

        .upload-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border: 1px solid #bed1c4;
          border-radius: 50%;
          color: var(--scan-green);
          font-size: 27px;
        }

        .upload-box h3 {
          margin: 14px 0 0;
          color: var(--scan-ink);
          font-size: 17px;
        }

        .upload-box p,
        .file-info span,
        .loading-message {
          color: var(--scan-muted);
          font-size: 13px;
        }

        .upload-button,
        .new-analysis-button,
        .analyze-button {
          border-radius: 4px;
          background: var(--scan-green);
        }

        .image-preview-container {
          border-color: var(--scan-line);
          border-radius: 6px;
        }

        .crop-preview {
          background: #f2f5f2;
        }

        .file-info {
          background: #f7f9f7;
        }

        .change-image-button {
          border-color: var(--scan-green);
          border-radius: 4px;
          color: var(--scan-green);
        }

        .result-header h2 {
          margin: 6px 0 0;
          color: var(--scan-ink);
          font-size: 23px;
        }

        .result-header p {
          margin: 7px 0 0;
          color: var(--scan-muted);
          font-size: 13px;
        }

        .result-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }

        .result-card {
          min-width: 0;
          padding: 15px;
        }

        .result-card span {
          color: var(--scan-muted);
          font-size: 12px;
        }

        .result-card strong {
          color: var(--scan-ink);
          font-size: 17px;
          line-height: 1.35;
          overflow-wrap: anywhere;
        }

        .confidence {
          display: block;
          line-height: 1.4;
        }

        .model-note,
        .section-description {
          color: var(--scan-muted);
          font-size: 12px;
          line-height: 1.6;
        }

        .model-note {
          margin: 10px 0 0;
        }

        .warning-box {
          display: grid;
          gap: 4px;
          border-radius: 5px;
          font-size: 13px;
          line-height: 1.55;
        }

        .recommendation-card,
        .predictions-card,
        .verification-box,
        .tracking-card,
        .capability-card {
          margin-top: 12px;
          padding: 18px;
        }

        .recommendation-card h3,
        .predictions-card h3,
        .verification-box h3,
        .tracking-card h3,
        .capability-card h3 {
          margin: 6px 0 0;
          color: var(--scan-ink);
          font-size: 16px;
        }

        .recommendation-card p,
        .verification-box p {
          margin-bottom: 0;
          color: #43584d;
          font-size: 13px;
        }

        .disease-advisory dl {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px 22px;
          margin: 14px 0 0;
        }

        .disease-advisory dl > div {
          min-width: 0;
          padding-top: 9px;
          border-top: 1px solid #edf1ed;
        }

        .disease-advisory dt {
          color: var(--scan-muted);
          font-size: 11px;
          font-weight: 700;
        }

        .disease-advisory dd {
          margin: 5px 0 0;
          color: #43584d;
          font-size: 12px;
          line-height: 1.6;
          overflow-wrap: anywhere;
        }

        .predictions-card .section-description,
        .tracking-card .section-description {
          margin: 7px 0 12px;
        }

        .prediction-name strong {
          color: var(--scan-ink);
          font-size: 13px;
          overflow-wrap: anywhere;
        }

        .prediction-score > span {
          color: var(--scan-muted);
        }

        .tracking-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .tracking-count {
          padding: 5px 8px;
          border-radius: 3px;
          background: #eff4ef;
          color: var(--scan-green);
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        .tracking-list {
          display: grid;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .tracking-list li {
          display: grid;
          grid-template-columns: 10px minmax(0, 1fr) auto;
          align-items: center;
          gap: 10px;
          min-height: 38px;
          border-top: 1px solid #edf1ed;
          color: var(--scan-muted);
          font-size: 12px;
        }

        .tracking-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #568a69;
        }

        .tracking-list strong {
          color: var(--scan-ink);
          font-size: 11px;
        }

        .capability-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          column-gap: 24px;
          margin-top: 10px;
        }

        .capability-grid > div {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 12px;
          min-height: 39px;
          padding: 9px 0;
          border-top: 1px solid #edf1ed;
          font-size: 12px;
        }

        .capability-grid > div > span {
          color: var(--scan-muted);
        }

        .capability-grid strong {
          color: #825d23;
          font-size: 11px;
          text-align: right;
        }

        .capability-grid strong.capability-supported {
          color: var(--scan-green);
        }

        .verification-box {
          background: #f5f8f5;
        }

        @media (max-width: 500px) {
          .crop-detection-page {
            padding: 18px 2px 32px;
          }

          .capability-grid {
            grid-template-columns: 1fr;
          }

          .disease-advisory dl {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .tracking-list li {
            grid-template-columns: 10px minmax(0, 1fr);
            padding: 6px 0;
          }

          .tracking-list strong {
            grid-column: 2;
          }
        }
      `}</style>
    </div>
  );
}

export default CropDetection;