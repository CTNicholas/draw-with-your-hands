import { Room, Storage } from "~/liveblocks.config";
import { createSignal, For, onCleanup, onMount } from "solid-js";
import styles from "./Canvas.module.css";
import { randomId } from "~/components/utils/randomId";
import { LiveList, LiveObject } from "@liveblocks/client";
import StrokePath from "~/components/StrokePath";

type Props = {
  room: Room;
  strokes: Storage["strokes"];
};

export default function Canvas({ room, strokes }: Props) {
  const [currentStroke, setCurrentStroke] = createSignal("");
  const [strokeIds, setStrokeIds] = createSignal<string[]>([...strokes.keys()]);

  function handlePointerDown(e: PointerEvent) {
    (e.target as SVGElement).setPointerCapture(e.pointerId);
    const id = randomId();
    strokes.set(
      id,
      new LiveObject({
        gradient: 3,
        points: new LiveList([[e.pageX, e.pageY, e.pressure]]),
      })
    );
    setCurrentStroke(id);
  }

  function handlePointerMove(e: PointerEvent) {
    if (e.buttons !== 1) {
      return;
    }

    (e.target as SVGElement).setPointerCapture(e.pointerId);
    strokes
      ?.get(currentStroke())
      ?.get("points")
      .push([e.pageX, e.pageY, e.pressure]);
  }

  onMount(() => {
    const unsubscribe = room.subscribe(
      strokes,
      (newStrokes: Storage["strokes"]) => {
        setStrokeIds([...newStrokes.keys()]);
      }
    );

    onCleanup(unsubscribe);
  });

  return (
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
          const stroke = strokes.get(id);
          return stroke ? <StrokePath room={room} stroke={stroke} /> : null;
        }}
      </For>
    </svg>
  );
}
