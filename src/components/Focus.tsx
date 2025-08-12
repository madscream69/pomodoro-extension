import { useState, useEffect, useRef } from 'react';
import './Focus.scss';
import audioSrc from '/sounds/tictictictic.mp3';

import play from '../assets/play-icon.svg';
import pause from '../assets/pause-icon.svg';
import reset from '../assets/reset-icon.svg';

interface funcProps {
    disableFunc: () => void;
}

const Focus = ({ disableFunc }: funcProps) => {
    const durations = { work: 25 * 60 * 1000, break: 5 * 60 * 1000 };
    const [mode, setMode] = useState<'work' | 'break'>('work');
    const [isAutoplay, setIsAutoplay] = useState(true);
    const [finished, setFinished] = useState(false);
    const [time, setTime] = useState(durations[mode]);
    const [isRunning, setIsRunning] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Load from chrome.storage
    useEffect(() => {
        chrome.storage.local.get(['mode', 'remainingTime', 'isRunning'], (data) => {
            setMode(data.mode || 'work');
            setTime(data.remainingTime || durations[mode]);
            setIsRunning(data.isRunning || false);
        });
    }, []);

    // Listen for background messages (finished/tick)
    useEffect(() => {
        const listener = (message: any) => {
            if (message.type === 'finished') {
                setFinished(true);
                setIsRunning(false);
                setTime(0);
                if (isAutoplay) {
                    switchMode(mode === 'work' ? 'break' : 'work');
                }
                if (audioRef.current) audioRef.current.play();
            }
        };
        chrome.runtime.onMessage.addListener(listener);
        return () => chrome.runtime.onMessage.removeListener(listener);
    }, [isAutoplay, mode]);

    const startTimer = () => {
        if (!isRunning && time > 0) {
            setIsRunning(true);
            chrome.runtime.sendMessage({ command: 'start', time }, (response) => {
                console.log(response);
            });
        }
    };

    const pauseTimer = () => {
        setIsRunning(false);
        chrome.runtime.sendMessage({ command: 'pause' });
    };

    const resetTimer = () => {
        setIsRunning(false);
        setTime(durations[mode]);
        chrome.runtime.sendMessage({ command: 'reset' });
    };

    const switchMode = (newMode: 'work' | 'break') => {
        setMode(newMode);
        setTime(durations[newMode]);
        setFinished(false);
        setIsRunning(false);
        chrome.runtime.sendMessage({ command: 'switchMode', newMode });
        chrome.storage.local.set({ mode: newMode });
    };

    // Sync time from storage (for tick)
    useEffect(() => {
        const interval = setInterval(() => {
            chrome.storage.local.get('remainingTime', (data) => {
                if (data.remainingTime !== undefined) setTime(data.remainingTime);
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Audio init
    useEffect(() => {
        audioRef.current = new Audio(audioSrc);
        audioRef.current.preload = 'auto';
    }, []);

    // Save on change
    useEffect(() => {
        chrome.storage.local.set({ time, mode });
    }, [time, mode]);

    // Autoplay
    useEffect(() => {
        if (isAutoplay && !isRunning && finished) {
            startTimer();
        }
    }, [finished]);

    const formatTime = (ms: number): string => {
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="pomodoro">
            <div className="pomodoro-timer__wrapper">
                <button onClick={disableFunc} className="close-btn">&times;</button>
                <h2 className='pomodoro-timer'>{formatTime(time)}</h2>
                <div className="switch-box">
                    <span className={`switch-text${mode === 'break' ? ' switch-text--active' : ''}`}>Break</span>
                    <label onChange={() => switchMode(mode === 'break' ? 'work' : 'break')} className="switch-label">
                        <input className="switch-input" type="checkbox" checked={mode === 'work'}/>
                        <span className="switch-slider"></span>
                    </label>
                    <span className={`switch-text${mode === 'work' ? ' switch-text--active' : ''}`}>Work</span>
                </div>
                <div className="controls">
                    <button
                        className="control-btn"
                        onClick={() => {
                            if (isRunning) {
                                pauseTimer();
                                // setIsActive(!isActive);
                            } else {
                                startTimer();
                                // setIsActive(!isActive);
                            }

                        }}
                    >
                        <img
                            className="icon-btn"
                            src={isRunning ? pause : play}
                            alt=""
                        />
                    </button>
                    <button className='reset-btn' onClick={resetTimer}><img className="reset__icon-btn"
                                                                            src={reset} alt="Reset"/></button>
                </div>
                <div className="automatic-wrapper">
                    <div className="round">
                        <input onClick={() => setIsAutoplay(!isAutoplay)}  type="checkbox" id="automatic" checked={isAutoplay}/>
                        <label htmlFor="automatic"></label>
                    </div>
                    <span className="automatic-wrapper__text"><label htmlFor="automatic">Change timer automatically</label></span>
                </div>
            </div>

        </div>
    );
};

export default Focus;
