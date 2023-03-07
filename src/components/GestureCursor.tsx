import { Show } from "solid-js";
import { Coords, Gesture } from "~/components/GestureRecognition";
import styles from "./GestureCursor.module.css";

type Props = {
  coords: Coords | null;
  gesture: Gesture | null;
};

const gestureEmoji: Record<Gesture, string> = {
  Open_Palm: "👋",
  Closed_Fist: "✊",
  Thumb_Up: "👍",
  Thumb_Down: "👎",
  ILoveYou: "🤘",
  Victory: "✌",
  Pointing_Up: "☝",
};

export default function GestureCursor(props: Props) {
  return (
    <Show keyed={false} when={props.coords && props.gesture}>
      <div
        style={{
          transform: `translateX(${(1 - props!.coords!.x) * 100}%) translateY(${
            props!.coords!.y * 100
          }%)`,
        }}
        class={styles.gestureCursor}
      >
        <div class={styles.gestureEmoji}>
          {gestureEmoji[props.gesture as Gesture]}
        </div>
      </div>
    </Show>
  );
}
