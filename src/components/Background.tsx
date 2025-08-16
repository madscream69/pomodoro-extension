import React, {useEffect, useState} from "react";
import Loading from "./Loading.tsx";
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

interface BackgroundProps {
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    error: string|null;
    setError: React.Dispatch<React.SetStateAction<string|null>>;
    activeAboutPhoto: boolean;
    setActiveAboutPhoto: React.Dispatch<React.SetStateAction<boolean>>;
    setDataP: React.Dispatch<React.SetStateAction<Photo>>;
    dataP: Photo;
}

const Background:React.FC<BackgroundProps> = ({loading, setLoading, error, setError, setDataP}) => {
    const [bg, setBg] = useState(localStorage.getItem('photoData') ? JSON.parse(localStorage.getItem('photoData') as string).src.original : '');
    // const [dataP, setDataP] = useState<Photo>();
    // const [activeAboutPhoto, SetActiveAboutPhoto] = useState(false);
    // const [loading, setLoading] = useState(true);
    // const [error, setError] = useState<string | null>(null);

    async function getBg(attempt = 1, maxAttempts = 3) {
        try {
            setLoading(true);
            const apiKey = import.meta.env.VITE_UNSPLASH_API_KEY_ACCESS;
            if (!apiKey) {
                throw new Error('Unsplash API key is missing');
            }

            // Запрос к Unsplash API для получения случайного изображения
            const url = `https://api.unsplash.com/photos/random?query=natural+mountains+forest+sea+ocean+sunset&orientation=landscape&w=1920&h=1080`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Client-ID ${apiKey}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Логирование для отладки
            console.log('Unsplash API response:', data);

            // Проверка наличия результата
            if (!data || !data.urls) {
                if (attempt < maxAttempts) {
                    console.log(`Attempt ${attempt} failed, retrying...`);
                    return getBg(attempt + 1, maxAttempts);
                }
                throw new Error('No valid image found');
            }

            // Формирование объекта Photo
            const photo: Photo = {
                id: data.id,
                width: data.width,
                height: data.height,
                url: data.links.html, // Ссылка на страницу изображения
                alt: data.alt_description || null,
                photographer: data.user.name || null,
                photographer_url: data.user.links.html || null || undefined,
                src: {
                    original: data.urls.full,
                    large: data.urls.regular, // ~1080p
                    medium: data.urls.small,
                    small: data.urls.thumb,
                },
            };

            console.log('Selected image:', photo);
            setBg(photo.src.original);
            localStorage.setItem('photoData', JSON.stringify(photo));
            setDataP(photo);
            localStorage.setItem('photoTimestamp', Date.now().toString());

        } catch (error) {
            console.error('Fetch error:', error);
            setError('Failed to load background image');
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        const storedData = localStorage.getItem('photoData');
        const storedTimestamp = localStorage.getItem('photoTimestamp');
        const now = Date.now();
        if(storedData && storedTimestamp && now - parseInt(storedTimestamp) >= 24 * 60 * 60 * 1000){
            getBg();
        }
        else if(localStorage.getItem('photoData')){
            setLoading(false);
        }
        else{
            getBg();
        }
    }, []);
    if (loading) return <Loading/>;
    if (error) return <div>{error}</div>;

    return (<img className="background-img" src={bg} alt="bg" />)
}
export default  Background;


// NADO BUDET PERESMOTRET LOADING