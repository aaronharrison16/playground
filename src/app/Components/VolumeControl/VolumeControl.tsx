'use client'

import { SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/react/16/solid"
import * as Slider from "@radix-ui/react-slider"
import { motion, useMotionValue, animate, useTransform, useMotionValueEvent, transform } from "framer-motion"
import { ElementRef, useRef, useState, useTransition } from "react"

function decay(value: number, max: number) {
  let entry = value / max;
  let sigmoid = 2 / (1 + Math.exp(-entry)) - 1;

  return sigmoid * max;
}

const VolumeControl = () => {
  let [volume, setVolume] = useState(50)
  let [region, setRegion] = useState<"left" | "right" | "middle">("middle")
  let ref = useRef<ElementRef<typeof Slider.Root>>(null);
  let overflow = useMotionValue(0);
  let scale = useMotionValue(1);
  let clientX = useMotionValue(0);

  useMotionValueEvent(clientX, "change", (latest) => {
    if (ref.current)
    {
      let { left, right } = ref.current?.getBoundingClientRect()
      let newOverflow

      if (latest < left)
      {
        setRegion("left")
        newOverflow = left - latest
      }
      else if (latest > right)
      {
        setRegion("right")
        newOverflow = latest - right
      }
      else
      {
        setRegion("middle")
        newOverflow = 0
      }

      overflow.jump(decay(newOverflow, 75))
    }
  })

  return (
    <motion.div
      onHoverStart={() => animate(scale, 1.2)}
      onHoverEnd={() => animate(scale, 1)}
      style={{ scale }}
      className="flex w-full touch-none select-none items-center justify-center gap-3 max-w-sm"
    >
      <motion.div
        animate={{
          scale: region === 'left' ? [1, 1.4, 1] : 1,
          transition: { duration: 0.25 }
        }}
        style={{
          x: useTransform(() => (region === 'left' ? -overflow.get() / scale.get() : 0)) 
        }}
      >
        <SpeakerXMarkIcon className="size-5 text-white" />
      </motion.div>

      <Slider.Root
        ref={ref}
        onPointerMove={(e) => {
          if (e.buttons > 0)
          {
            clientX.set(e.clientX)
          }
        }}
        onLostPointerCapture={() => {
          animate(overflow, 0, { type: 'spring', bounce: 0.5 })
        }}
        value={[volume]}
        onValueChange={([v]) => setVolume(v)}
        className="relative flex w-full grow cursor-grab touch-none select-none items-center py-4 active:cursor-grabbing"
      >
        <motion.div
          style={{
            transformOrigin: region === "left" ? 'right' : 'left',
            scaleY: useTransform(overflow, [0,75], [1, 0.75]),
            scaleX: useTransform(() => {
              if (ref.current)
              {
                let bounds = ref.current?.getBoundingClientRect()
                return (bounds.width + overflow.get()) / bounds.width
              }
            }),
            height: useTransform(scale, [1, 1.2], [6, 16]),
            marginTop: useTransform(scale, [1, 1.2], [0, -5]),
            marginBottom: useTransform(scale, [1, 1.2], [0, -5]),
          }}
          className="flex grow"
        >
          <Slider.Track className="relative h-full grow overflow-hidden rounded-full bg-gray-500">
            <Slider.Range className="absolute h-full bg-white" />
          </Slider.Track>
        </motion.div>

        <Slider.Thumb />
      </Slider.Root>

      <motion.div
        animate={{
          scale: region === 'right' ? [1, 1.4, 1] : 1,
          transition: { duration: 0.25 }
        }}
        style={{ x: useTransform(() => (
          region === 'right' ? overflow.get() / scale.get() : 0 
        ))}}
      >
        <SpeakerWaveIcon className="size-5 text-white" />
      </motion.div>
    </motion.div>
  )
}

export default VolumeControl