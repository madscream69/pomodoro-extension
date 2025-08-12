// src/Timer.tsx
import React, { useState, useEffect, useRef } from 'react';
import audioSrc from '/sounds/tictictictic.mp3';
interface TimerProps {
    initialTime: number; // В миллисекундах
}

const Timer: React.FC<TimerProps> = ({ initialTime }) => {
    const [time, setTime] = useState(initialTime);
    const [isRunning, setIsRunning] = useState(false);
    const workerRef = useRef<Worker | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Инициализация Web Worker
    useEffect(() => {
        workerRef.current = new Worker(new URL('../Worker/worker.ts', import.meta.url));
        workerRef.current.onmessage = (e: MessageEvent) => {
            const { type, remainingTime } = e.data;
            if (type === 'tick') {
                setTime(remainingTime);
            } else if (type === 'finished') {
                setIsRunning(false);
                setTime(0);
                if (audioRef.current) {
                    audioRef.current.play().catch((error) => {
                        console.error('Ошибка воспроизведения звука:', error);
                    });
                }
            }
        };

        return () => {
            workerRef.current?.terminate();
        };
    }, []);

    // Инициализация аудио
    useEffect(() => {
        audioRef.current = new Audio(audioSrc);
        audioRef.current.preload = 'auto';
    }, []);

    const startTimer = () => {
        if (!isRunning && time > 0) {
            setIsRunning(true);
            workerRef.current?.postMessage({ command: 'start', time });
        }
    };

    const pauseTimer = () => {
        setIsRunning(false);
        workerRef.current?.postMessage({ command: 'pause' });
    };

    const resetTimer = () => {
        setIsRunning(false);
        setTime(initialTime);
        workerRef.current?.postMessage({ command: 'reset', time: initialTime });
    };

    // Форматирование времени
    const formatTime = (ms: number): string => {
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="timer-container">
            <h1>{formatTime(time)}</h1>
            <div>
                <button onClick={startTimer} disabled={isRunning || time === 0}>
                    Start
                </button>
                <button onClick={pauseTimer} disabled={!isRunning}>
                    Pause
                </button>
                <button onClick={resetTimer}>Reset</button>
            </div>
        </div>
    );
};

export default Timer;