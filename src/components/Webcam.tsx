import { createSignal, onMount, Show } from "solid-js";
import { FilesetResolver, GestureRecognizer } from "@mediapipe/tasks-vision";
import styles from "./Webcam.module.css";

export default function Webcam() {
  let video!: HTMLVideoElement;
  const [webcamRunning, setWebcamRunning] = createSignal(false);
  const [error, setError] = createSignal(false);

  onMount(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError(true);
      return;
    }
  });

  function enableWebcam() {
    const constraints = {
      video: true,
    };

    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
      video.srcObject = stream;
      video.play();
      setWebcamRunning(true);
      // video.addEventListener("loadeddata", predictWebcam);
    });
  }

  return (
    <div class={styles.webcam}>
      <Show
        keyed={false}
        when={!error()}
        fallback={<div>Webcam not supported</div>}
      >
        <video ref={video} />
      </Show>
      <Show keyed={false} when={!webcamRunning()}>
        <button onClick={enableWebcam} class={styles.enableWebcam}>
          Enable webcam
        </button>
      </Show>
    </div>
  );
}

function a() {
  const demosSection = document.getElementById("demos");
  let gestureRecognizer: GestureRecognizer;
  let runningMode = "IMAGE";
  let enableWebcamButton: HTMLButtonElement;
  let webcamRunning: Boolean = false;
  const videoHeight = "360px";
  const videoWidth = "480px";

  // Before we can use HandLandmarker class we must wait for it to finish
  // loading. Machine Learning models can be large and take a moment to
  // get everything needed to run.
  async function runDemo() {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );
    gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/gesture_recognizer.task",
      },
      runningMode: runningMode,
    });
    demosSection.classList.remove("invisible");
  }

  runDemo();

  const video = document.getElementById("webcam");
  const canvasElement = document.getElementById("output_canvas");
  const canvasCtx = canvasElement.getContext("2d");
  const gestureOutput = document.getElementById("gesture_output");

  // Check if webcam access is supported.
  function hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  // If webcam supported, add event listener to button for when user
  // wants to activate it.
  if (hasGetUserMedia()) {
    enableWebcamButton = document.getElementById("webcamButton");
    enableWebcamButton.addEventListener("click", enableCam);
  } else {
    console.warn("getUserMedia() is not supported by your browser");
  }

  // Enable the live webcam view and start detection.
  function enableCam(event) {
    if (!gestureRecognizer) {
      alert("Please wait for gestureRecognizer to load");
      return;
    }

    if (webcamRunning === true) {
      webcamRunning = false;
      enableWebcamButton.innerText = "ENABLE PREDICTIONS";
    } else {
      webcamRunning = true;
      enableWebcamButton.innerText = "DISABLE PREDICITONS";
    }

    // getUsermedia parameters.
    const constraints = {
      video: true,
    };

    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
      video.srcObject = stream;
      video.addEventListener("loadeddata", predictWebcam);
    });
  }

  async function predictWebcam() {
    const webcamElement = document.getElementById("webcam");
    // Now let's start detecting the stream.
    if (runningMode === "IMAGE") {
      runningMode = "VIDEO";
      await gestureRecognizer.setOptions({ runningMode: runningMode });
    }
    let nowInMs = Date.now();
    const results = await gestureRecognizer.recognizeForVideo(video, nowInMs);

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    canvasElement.style.height = videoHeight;
    webcamElement.style.height = videoHeight;
    canvasElement.style.width = videoWidth;
    webcamElement.style.width = videoWidth;
    if (results.landmarks) {
      for (const landmarks of results.landmarks) {
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 5,
        });
        drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2 });
      }
    }
    canvasCtx.restore();
    if (results.gestures.length > 0) {
      gestureOutput.style.display = "block";
      gestureOutput.style.width = videoWidth;
      gestureOutput.innerText =
        "GestureRecognizer: " +
        results.gestures[0][0].categoryName +
        "\n Confidence: " +
        Math.round(parseFloat(results.gestures[0][0].score) * 100) +
        "%";
    } else {
      gestureOutput.style.display = "none";
    }
    // Call this function again to keep predicting when the browser is ready.
    if (webcamRunning === true) {
      window.requestAnimationFrame(predictWebcam);
    }
  }
}
