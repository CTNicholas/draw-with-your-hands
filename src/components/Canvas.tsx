import { Point, Room, Storage } from "~/liveblocks.config";
import { createSignal, For, onCleanup, onMount } from "solid-js";
import styles from "./Canvas.module.css";
import { randomId } from "~/components/utils/randomId";
import { LiveList, LiveObject } from "@liveblocks/client";
import StrokePath from "~/components/StrokePath";
import GestureRecognition, {
  Coords,
  Gesture,
  onGestureResult,
} from "~/components/GestureRecognition";
import GestureCursor from "~/components/GestureCursor";
import { getWindowSize } from "~/components/utils/getWindowSize";

type Props = {
  room: Room;
  strokes: Storage["strokes"];
};

export default function Canvas(props: Props) {
  const [currentlyDrawing, setCurrentlyDrawing] = createSignal(false);

  const [currentStroke, setCurrentStroke] = createSignal("");
  const [strokeIds, setStrokeIds] = createSignal<string[]>([
    ...props.strokes.keys(),
  ]);

  const [currentGesture, setCurrentGesture] = createSignal<Gesture | null>(
    null
  );
  const [currentCoords, setCurrentCoords] = createSignal<Coords | null>(null);

  function startStroke([x, y, pressure]: Point) {
    const id = randomId();
    props.strokes.set(
      id,
      new LiveObject({
        gradient: 3,
        points: new LiveList([[x, y, pressure || 0.5]]),
      })
    );
    setCurrentStroke(id);
  }

  function continueStroke([x, y, pressure]: Point) {
    props.strokes
      ?.get(currentStroke())
      ?.get("points")
      .push([x, y, pressure || 0.5]);
  }

  function handlePointerDown(e: PointerEvent) {
    setCurrentlyDrawing(true);
    (e.target as SVGElement).setPointerCapture(e.pointerId);
    startStroke([e.pageX, e.pageY, e.pressure]);
  }

  function handlePointerMove(e: PointerEvent) {
    if (e.buttons !== 1) {
      return;
    }

    continueStroke([e.pageX, e.pageY, e.pressure]);
  }

  function handlePointerUp() {
    setCurrentlyDrawing(false);
  }

  function handleGesture({ gesture, coords }: onGestureResult) {
    setCurrentGesture(gesture);
    setCurrentCoords(coords);

    if (!gesture || !coords) {
      return;
    }

    if (gesture === "Closed_Fist") {
      setCurrentlyDrawing(false);
      return;
    }

    if (gesture === "Open_Palm") {
      const { width, height } = getWindowSize();
      if (currentlyDrawing()) {
        continueStroke([(1 - coords.x) * width, coords.y * height, 0.5]);
      } else {
        startStroke([(1 - coords.x) * width, coords.y * height, 0.5]);
        setCurrentlyDrawing(true);
      }
    }
  }

  onMount(() => {
    const unsubscribe = props.room.subscribe(
      props.strokes,
      (newStrokes: Storage["strokes"]) => {
        setStrokeIds([...newStrokes.keys()]);
      }
    );

    onCleanup(unsubscribe);
  });

  return (
    <div class={styles.canvas}>
      <svg
        class={styles.svg}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      >
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#A774FF" />
            <stop offset="100%" stop-color="#E28295" />
          </linearGradient>
        </defs>
        <For each={[...strokeIds()]}>
          {(id) => {
            const stroke = props.strokes.get(id);
            return stroke ? (
              <StrokePath room={props.room} stroke={stroke} />
            ) : null;
          }}
        </For>
      </svg>
      <GestureRecognition onGesture={handleGesture} />
      <GestureCursor coords={currentCoords()} gesture={currentGesture()} />
    </div>
  );
}
