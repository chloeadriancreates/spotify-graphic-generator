import './SpotifyGraphic.scss';

const SpotifyGraphic = ({ episode }) => {
    const { images, show, name, description } = episode;
    return (
                <div id="spotify-graphic">
                    <img src={images[0].url} alt={show.name} />
                    <div className="title">
                        <h2>{name}</h2>
                        <h3>{show.name}</h3>
                    </div>
                    <p>{description}</p>
                </div>
    );
}

export default SpotifyGraphic;
