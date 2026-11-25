// Shared responsive video embed for CMS-managed videoUrl fields (Programme
// Details, About page). YouTube/Vimeo links need an embed iframe; anything
// else is assumed to be a direct video file the browser can play natively.
export default function VideoEmbed({ url }: { url: string }) {
  const youtube = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/);
  const vimeo = url.match(/vimeo\.com\/(\d+)/);

  if (youtube) {
    return (
      <div className="program-video-frame">
        <iframe
          src={`https://www.youtube.com/embed/${youtube[1]}`}
          title="Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  if (vimeo) {
    return (
      <div className="program-video-frame">
        <iframe src={`https://player.vimeo.com/video/${vimeo[1]}`} title="Video" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
      </div>
    );
  }
  return (
    <div className="program-video-frame">
      <video src={url} controls />
    </div>
  );
}
