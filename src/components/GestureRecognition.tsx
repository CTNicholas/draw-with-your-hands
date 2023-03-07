import { createSignal, onMount } from "solid-js";
import { FilesetResolver, GestureRecognizer } from "@mediapipe/tasks-vision";
import Webcam from "~/components/Webcam";
import styles from "./GestureRecognition.module.css";

export type Coords = { x: number; y: number; z: number };

export type Gesture =
  | "Open_Palm"
  | "Closed_Fist"
  | "Thumb_Up"
  | "Thumb_Down"
  | "ILoveYou"
  | "Victory"
  | "Pointing_Up";

export type onGestureResult = {
  coords: Coords | null;
  gesture: Gesture | null;
};

type Props = {
  onGesture: ({ gesture, coords }: onGestureResult) => void;
};

export default function GestureRecognition(props: Props) {
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
      const result = {
        coords: results.landmarks[0]?.[0] || null,
        gesture: (results.gestures[0]?.[0]?.categoryName as Gesture) || null,
      };
      props.onGesture(result);
      setGesture(JSON.stringify(result));
    }

    setTimeout(() => {
      handleWebcamReady(video);
    }, 50);
    //window.requestAnimationFrame(() => handleWebcamReady(video));
  }

  return (
    <div class={styles.gestureRecognition}>
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
