import { onMount } from "solid-js";
import { FilesetResolver, GestureRecognizer } from "@mediapipe/tasks-vision";
import Webcam from "~/components/Webcam";
import styles from "./GestureRecognition.module.css";

export default function GestureRecognition() {
  onMount(() => {
    // setup();
  });
  return (
    <div class={styles.gestureRecognition}>
      <Webcam />
    </div>
  );
}

async function setup() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );
  const gestureRecognizer = await GestureRecognizer.createFromModelPath(
    vision,
    "https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/gesture_recognizer.task"
  );
  const image = document.getElementById("image") as HTMLImageElement;
  const recognitions = gestureRecognizer.recognize(image);
}
