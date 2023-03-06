import { createSignal, onMount } from "solid-js";
import { FilesetResolver, GestureRecognizer } from "@mediapipe/tasks-vision";
import Webcam from "~/components/Webcam";
import styles from "./GestureRecognition.module.css";

export default function GestureRecognition() {
  const [gestureRecognizer, setGestureRecognizer] =
    createSignal<GestureRecognizer>();
  const [gesture, setGesture] = createSignal("NONE");

  onMount(() => {
    setup().then(setGestureRecognizer);
  });

  async function handleWebcamReady(video: HTMLVideoElement) {
    if (gestureRecognizer()) {
      let nowInMs = Date.now();
      const results = await gestureRecognizer()!.recognizeForVideo(
        video,
        nowInMs
      );
      //console.log(results);
      //setGesture(JSON.stringify(results.landmarks[0]?.[0], null, 2));
    }

    //setTimeout(() => {
    //  handleWebcamReady(video);
    //}, 100);
    window.requestAnimationFrame(() => handleWebcamReady(video));
  }

  return (
    <div class={styles.gestureRecognition}>
      {gesture}
      <Webcam onReady={handleWebcamReady} />
    </div>
  );
}

async function setup() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );
  return await GestureRecognizer.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "/gesture_recognizer.task",
    },
    runningMode: "VIDEO",
  });
}
