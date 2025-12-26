'use client';

import { useState, useEffect, useRef } from 'react';

interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    abort: () => void;
}

declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

export function useVoiceInput(onTranscript: (text: string) => void) {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        // Check if browser supports speech recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            setIsSupported(true);
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.addEventListener('result', (event: Event) => {
                const e = event as SpeechRecognitionEvent;
                const transcript = Array.from(e.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');

                onTranscript(transcript);
                setIsListening(false);
            });

            recognition.addEventListener('error', (event: Event) => {
                const e = event as SpeechRecognitionErrorEvent;
                console.error('Speech recognition error:', e.error);
                setIsListening(false);
            });

            recognition.addEventListener('end', () => {
                setIsListening(false);
            });

            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, [onTranscript]);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    return { isListening, isSupported, startListening, stopListening };
}

export function useVoiceOutput() {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        setIsSupported('speechSynthesis' in window);
    }, []);

    const speak = (text: string) => {
        if (!isSupported) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        // Remove JSON formatting if present
        let cleanText = text;
        try {
            const parsed = JSON.parse(text);
            cleanText = parsed.text || text;
        } catch {
            // Not JSON, use as is
        }

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    const stop = () => {
        if (isSupported) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    return { isSpeaking, isSupported, speak, stop };
}
