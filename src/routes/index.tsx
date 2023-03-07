import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { enterRoom, leaveRoom, Room, Storage } from "~/liveblocks.config";
import { LiveMap } from "@liveblocks/client";
import Canvas from "~/components/Canvas";
import Template from "~/components/Template";
import DeleteButton from "~/components/DeleteButton";

const roomId = "my-solid-room-2";

export default function Home() {
  const [room] = createSignal<Room>(
    enterRoom(roomId, {
      initialPresence: {},
      initialStorage: { strokes: new LiveMap() },
    })
  );

  const [strokes, setStrokes] = createSignal<Storage["strokes"] | null>(null);

  onMount(() => {
    async function run() {
      const { root } = await room().getStorage();
      setStrokes(root.get("strokes"));

      const unsubscribe = room().subscribe("event", ({ event }) => {
        if (event.type === "RESET") {
          setStrokes(root.get("strokes"));
        }
      });

      onCleanup(unsubscribe);
    }

    run();
  });

  async function handleReset() {
    const { root } = await room().getStorage();
    root.set("strokes", new LiveMap());
    setStrokes(root.get("strokes"));
    room().broadcastEvent({ type: "RESET" });
  }

  onCleanup(() => {
    leaveRoom(roomId);
  });

  return (
    <Template>
      <Show
        keyed={true}
        when={room() && strokes()}
        fallback={<div style={{ color: "white" }}>loading (TODO)...</div>}
      >
        <Canvas room={room()} strokes={strokes() as Storage["strokes"]} />
      </Show>

      <DeleteButton onClick={handleReset} />
    </Template>
  );
}
