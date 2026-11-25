// Renders an article's typed blocks. Server component — the full text ships
// in the initial HTML, which is the entire point of these pages.

import Image from "next/image";
import type { Block } from "@/lib/resources";

export default function ArticleBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2":
            return <h2 key={i}>{b.text}</h2>;
          case "h3":
            return <h3 key={i}>{b.text}</h3>;
          case "p":
            return <p key={i}>{b.text}</p>;
          case "ul":
            return (
              <ul key={i}>
                {b.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i}>
                {b.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ol>
            );
          case "code":
            return (
              <pre key={i}>
                <code>{b.code}</code>
              </pre>
            );
          case "callout":
            return (
              <aside className="prose-callout" key={i}>
                {b.text}
              </aside>
            );
          case "image":
            return (
              <span className="prose-image" key={i}>
                <Image src={b.src} alt={b.alt ?? ""} width={1200} height={675} sizes="(max-width: 768px) 100vw, 800px" />
              </span>
            );
          case "table":
            return (
              <table key={i}>
                <tbody>
                  {b.rows.map((row, r) => (
                    <tr key={r}>
                      {row.map((cell, c) => (
                        <td key={c}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          case "embed":
            return (
              <span className="prose-embed" key={i}>
                <iframe src={b.url} loading="lazy" allowFullScreen title={`embed-${i}`} />
              </span>
            );
        }
      })}
    </div>
  );
}
