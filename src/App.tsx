import { useEffect, useState } from 'react';
import './App.scss';
import Focus from './components/Focus';
import Background from "./components/Background.tsx";

// Интерфейс для данных Unsplash
interface Photo {
    id: string; // Unsplash использует строковые ID
    width: number;
    height: number;
    url: string;
    alt: string | null;
    photographer: string | null;
    photographer_url: string | null;
    src: {
        original: string;
        large: string;
        medium: string;
        small: string;
    };
}

function App() {
    // const [bg, setBg] = useState('');
    const [time, setTime] = useState(new Date());
    const [focus, setFocus] = useState(false);
    //peredat
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeAboutPhoto, SetActiveAboutPhoto] = useState(false);
    const [dataP, setDataP] = useState<Photo>(localStorage.getItem('photoData') && JSON.parse(localStorage.getItem('photoData') as string));
    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const hours = time.getHours();
    const minutes = time.getMinutes();
    const timeString = `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}`;

    // if (loading) return <div>Loading...</div>;
    // if (error) return <div>{error}</div>;

    function disableInterface():void {
        document.querySelector('.time__title')?.classList.toggle('disabled');
        document.querySelector('.about-photo ')?.classList.toggle('disabled');
        document.querySelector('.focus-btn ')?.classList.toggle('disabled');
        setFocus(!focus);
    }

    return (
        <>
            {focus && <Focus disableFunc={disableInterface}/>}
            <div
                onClick={() => {
                    setFocus(focus && false);
                    console.log('parent');
                }}
                className="background"
            >
                <Background loading={loading} setLoading={setLoading} error={error} setError={setError} activeAboutPhoto={activeAboutPhoto} setActiveAboutPhoto={SetActiveAboutPhoto} dataP={dataP} setDataP={setDataP}></Background>
                {/*<img className="background-img" src={bg} alt="bg" />*/}
                <div className="onFocus">
                    <button
                        className="focus-btn"
                        onClick={(e) => {
                            e.stopPropagation();

                            disableInterface();
                            console.log('child');
                        }}
                    >
                        Let's focus right now!
                    </button>
                </div>
                <div className="time">
                    <h1 className="time__title">{timeString}</h1>
                </div>
                <div className="info">
                    <div
                        className={`about-photo ${activeAboutPhoto ? 'about-photo--active' : ''}`}
                        onClick={() => SetActiveAboutPhoto(!activeAboutPhoto)}
                    >
                        {activeAboutPhoto ? (
                            <>
                                <p className="author">Photographer: </p>
                                <a href={dataP?.photographer_url || undefined} className="author-link">
                                    {dataP?.photographer && dataP.photographer.length > 20
                                        ? `${dataP.photographer.slice(0, 20)}...`
                                        : dataP?.photographer || 'Unknown'}
                                </a>
                                <p className="original-img">Original: </p>
                                <a href={dataP?.url} className="img-link">
                                    {dataP?.alt && dataP.alt.length > 20
                                        ? `${dataP.alt.slice(0, 20)}...`
                                        : dataP?.alt || 'No description'}
                                </a>
                            </>
                        ) : (
                            <p className="original-img">More about photo...</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default App;