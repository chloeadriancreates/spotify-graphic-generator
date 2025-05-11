import { useEffect, useState } from "react";
import { FastAverageColor } from "fast-average-color";
import * as htmlToImage from "html-to-image";
import "./Home.scss";
import SpotifyGraphic from "../../components/SpotifyGraphic/SpotifyGraphic";

const Home = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const firefox = navigator.userAgent.indexOf("Firefox") > -1;
  const safari = navigator.userAgent.indexOf("Chrome") === -1 && navigator.userAgent.indexOf("Safari") > -1;

  const fetchEpisodeData = async (url) => {
    const options = {
      headers: { "Authorization": `Bearer ${document.cookie.split("; ").find(row => row.startsWith("spotify-token="))?.split("=")[1]}` }
    };
    try {
      const episodeID = url.replace("https://open.spotify.com/episode/", "");
      const response = await fetch(`https://api.spotify.com/v1/episodes/${episodeID}`, options);
      if (response.status === 200) {
        setData(await response.json());
      } else {
        setError("Uh-oh! Something seems to have gone wrong. Refresh the page and try again!");
      }
    } catch (error) {
      console.log(error);
      setError("Uh-oh! Something seems to have gone wrong. Refresh the page and try again!");
    }
  }

  const submitURL = () => {
    const url = document.querySelector("input").value;
    const regex = /https:\/\/open\.spotify\.com\/episode\/.+/;
    if (url) {
      if (url.match(regex)) {
        fetchEpisodeData(url);
        setError(null);
      } else {
        setError("This doesn’t look like an episode URL. Try copying the link directly from the share option in Spotify – it should start with “https://open.spotify.com/episode/”!");
      }
    } else {
      setError("Uh-oh! Something seems to have gone wrong. Refresh the page and try again!");
    }
  }

  const copyGraphic = async () => {
    const blob = htmlToImage.toBlob(document.getElementById("spotify-graphic"));
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
  }

  const downloadGraphic = async () => {
    const img = await htmlToImage.toJpeg(document.getElementById("spotify-graphic"), { quality: 1 });
    const link = document.createElement("a");
    link.download = `spotify-graphic-${data.id}.jpeg`;
    link.href = img;
    link.click();
  }

  useEffect(() => {
    const fetchToken = async () => {
      const options = {
        method: "POST",
        body: `grant_type=client_credentials&client_id=${process.env.REACT_APP_CLIENT_ID}&client_secret=${process.env.REACT_APP_CLIENT_SECRET}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }

      try {
        const response = await fetch("https://accounts.spotify.com/api/token", options);
        const object = await response.json();
        if (response.status === 200) {
          document.cookie = `spotify-token=${object["access_token"]}; max-age=${object["expires_in"]}; Secure`;
        } else {
          setError("Uh-oh! Something seems to have gone wrong. Refresh the page and try again!");
        }
      } catch (error) {
        console.log(error);
        setError("Uh-oh! Something seems to have gone wrong. Refresh the page and try again!");
      }
    }

    if (safari) {
      setError("Unfortunately, this current version doesn't work on Safari. I'm investigating why, but it might take some time, as this is a passion project I'm working on outside of work. In the meantime, you can create your graphic through Chrome or Firefox! Thank you for your patience :)");
    } else {
      const cookieToken = document.cookie.split("; ").find(row => row.startsWith("spotify-token="))?.split("=")[1];
      if (!cookieToken) {
        fetchToken();
      }
    }
  }, [safari]);

  useEffect(() => {
    const getAverageColor = async () => {
      const fac = new FastAverageColor();
      const color = await fac.getColorAsync(data.images[0].url);
      document.documentElement.style.setProperty("--custom-light", `rgb(${color.value[0]}, ${color.value[1]}, ${color.value[2]})`);
      document.documentElement.style.setProperty("--custom-dark", `rgb(${color.value[0] - 100}, ${color.value[1] - 100}, ${color.value[2] - 100})`);
    }

    if (data) {
      getAverageColor();
    }

  }, [data]);

  return (
    <div className="main">
      <h1>Spotify graphic generator</h1>
      <p className="description">Create a graphic inspired by the Spotify UI for any podcast episode! Paste the Spotify URL for the episode below, and watch the magic happen.</p>
      {error && <p className="error">{error}</p>}
      {!safari &&
        <div className="form">
          <input placeholder="Spotify episode URL" />
          <button onClick={submitURL}>Generate graphic</button>
        </div>
      }
      {data &&
        <div className="download">
          {!firefox && <button onClick={copyGraphic}>Copy as PNG</button>}
          <button onClick={downloadGraphic}>Download as JPG</button>
        </div>
      }
      {data && <SpotifyGraphic episode={data} />}
      <footer class="footer">Made with ♥ by <a href="https://chloeadrian.dev">Chloé Adrian</a> in 2025</footer>
    </div>
  );
}

export default Home;
