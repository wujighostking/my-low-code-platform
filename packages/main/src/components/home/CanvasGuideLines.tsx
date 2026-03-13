interface CanvasGuideLinesProps {
  vertical: number | null
  horizontal: number | null
}

function CanvasGuideLines({ vertical, horizontal }: CanvasGuideLinesProps) {
  return (
    <>
      {vertical !== null && (
        <div
          className="pointer-events-none absolute bg-[#1677ff]"
          style={{
            top: 0,
            left: vertical,
            width: 1,
            height: '100%',
          }}
        />
      )}
      {horizontal !== null && (
        <div
          className="pointer-events-none absolute bg-[#1677ff]"
          style={{
            top: horizontal,
            left: 0,
            width: '100%',
            height: 1,
          }}
        />
      )}
    </>
  )
}

export default CanvasGuideLines
