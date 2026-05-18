const firstLine = [
  { text: "Tìm", tone: "normal" },
  { text: "gia", tone: "normal" },
  { text: "sư", tone: "normal" },
  { text: "uy tín", tone: "highlight" },
] as const;

const secondLine = ["phù", "hợp", "cho", "con", "bạn"] as const;

export default function HeroHeadline() {
  return (
    <h1
      className="hero-title max-w-4xl font-extrabold text-white"
      style={{
        fontSize: "clamp(2.35rem, 3.35vw + 0.72rem, 4.75rem)",
        lineHeight: 1.06,
        letterSpacing: 0,
      }}
    >
      <span className="block">
        {firstLine.map((word) => (
          <span
            key={word.text}
            className={word.tone === "highlight" ? "hero-title-keyword" : "hero-title-word"}
          >
            {word.text}
          </span>
        ))}
      </span>
      <span className="block">
        {secondLine.map((word) => (
          <span
            key={word}
            className="hero-title-word"
          >
            {word}
          </span>
        ))}
      </span>
    </h1>
  );
}
