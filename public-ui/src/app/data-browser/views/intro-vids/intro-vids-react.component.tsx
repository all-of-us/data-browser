import * as React from "react";

import { withRouteData } from "app/components/app-router";
import { Video, videos } from "app/data-browser/services/video.service";

export const IntroVidReactComponent = withRouteData(
  class extends React.Component {
    render() {
      return (
        <div className="db-container">
          <h1
            className="primary-display"
            style={{ textAlign: "center", padding: "1rem" }}
          >
            Introductory Videos
          </h1>
          {videos.map((video: Video, index) => (
            <span key={index}>
              <h2 className="secondary-display">{video.title}</h2>
              <div
                style={{
                  width: "100%",
                  textAlign: "center",
                  padding: "1rem",
                  paddingBottom: "2rem",
                }}
              >
                <video
                  style={{
                    width: "calc((100%/12)*10)",
                    height: "auto",
                    outline: "none",
                  }}
                  poster={video.poster}
                  controls
                >
                  {video.src.map((source) => (
                    <source
                      key={source.url}
                      src={source.url}
                      type={source.type}
                    />
                  ))}
                  {video.subtitles.map((sub) => (
                    <track
                      key={sub.label}
                      default={sub.default}
                      label={sub.label}
                      lang={sub.lang}
                      src={sub.url}
                    />
                  ))}
                  Sorry, your browser doesn't support embedded videos, but don't
                  worry, you can{" "}
                  <a href={video.downloadUrl}>download this video here</a>
                  and watch it with your favorite video player!
                </video>
              </div>
            </span>
          ))}
        </div>
      );
    }
  }
);
