// src/App.jsx
import { useState, useEffect, useRef } from 'react';
import './App.css';

const SQUARE_SIZE = 32;
const SPRITE_SIZE = SQUARE_SIZE / 2;
const MOVE_DISTANCE = 100;
const SPEED = 10; // Speed in pixels per second
const randomInterval = () => Math.random() * (2000 - 200) + 200;

const App = () => {
    const [position, setPosition] = useState({ top: window.innerHeight / 2 - SQUARE_SIZE / 2, left: window.innerWidth / 2 - SQUARE_SIZE / 2 });
    const [spritePosition, setSpritePosition] = useState({
        top: Math.random() * (window.innerHeight - SPRITE_SIZE),
        left: Math.random() * (window.innerWidth - SPRITE_SIZE)
    });
    const [score, setScore] = useState(0);
    const [collisionDetected, setCollisionDetected] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [lastMoveTime, setLastMoveTime] = useState(Date.now());
    const [targetPosition, setTargetPosition] = useState(spritePosition);

    const spriteMoveTimeout = useRef(null);

    const handleKeyDown = (event) => {
        const { key } = event;
        setPosition((prevPosition) => {
            let newPos = { ...prevPosition };
            switch (key) {
                case 'ArrowUp':
                    newPos.top = Math.max(newPos.top - 20, 0);
                    break;
                case 'ArrowDown':
                    newPos.top = Math.min(newPos.top + 20, window.innerHeight - SQUARE_SIZE);
                    break;
                case 'ArrowLeft':
                    newPos.left = Math.max(newPos.left - 20, 0);
                    break;
                case 'ArrowRight':
                    newPos.left = Math.min(newPos.left + 20, window.innerWidth - SQUARE_SIZE);
                    break;
                default:
                    return prevPosition;
            }
            return newPos;
        });
    };

    const handleTouchMove = (event) => {
        const touch = event.touches[0];
        const newLeft = Math.min(Math.max(touch.clientX - SQUARE_SIZE / 2, 0), window.innerWidth - SQUARE_SIZE);
        const newTop = Math.min(Math.max(touch.clientY - SQUARE_SIZE / 2, 0), window.innerHeight - SQUARE_SIZE);

        setPosition({ top: newTop, left: newLeft });
    };

    const handleMouseMove = (event) => {
        const newLeft = Math.min(Math.max(event.clientX - SQUARE_SIZE / 2, 0), window.innerWidth - SQUARE_SIZE);
        const newTop = Math.min(Math.max(event.clientY - SQUARE_SIZE / 2, 0), window.innerHeight - SQUARE_SIZE);

        setPosition({
            top: newTop,
            left: newLeft,
        });
    };

    const moveSpriteRandomly = () => {
        const possibleMoves = [
            { top: spritePosition.top - MOVE_DISTANCE, left: spritePosition.left },
            { top: spritePosition.top + MOVE_DISTANCE, left: spritePosition.left },
            { top: spritePosition.top, left: spritePosition.left - MOVE_DISTANCE },
            { top: spritePosition.top, left: spritePosition.left + MOVE_DISTANCE },
        ];

        const validMoves = possibleMoves.filter(({ top, left }) =>
            top >= 0 &&
            top <= Math.max(0, window.innerHeight - SPRITE_SIZE) &&
            left >= 0 &&
            left <= Math.max(0, window.innerWidth - SPRITE_SIZE)
        );

        if (validMoves.length === 0) {
            return;
        }

        const newPosition = validMoves[Math.floor(Math.random() * validMoves.length)];
        setTargetPosition(newPosition);
        setLastMoveTime(Date.now());
        startSpriteMoveTimer();
    };

    const detectCollision = (pos1, pos2, size1, size2) => {
        const distanceX = Math.abs((pos1.left + size1 / 2) - (pos2.left + size2 / 2));
        const distanceY = Math.abs((pos1.top + size1 / 2) - (pos2.top + size2 / 2));
        const collisionThresholdX = size1 / 2 + size2 / 2;
        const collisionThresholdY = size1 / 2 + size2 / 2;

        const xCollision = distanceX < collisionThresholdX;
        const yCollision = distanceY < collisionThresholdY;

        setCollisionDetected(xCollision && yCollision);

        return xCollision && yCollision;
    };

    const CoordinatesDisplay = () => {
        return (
            <div className="coordinates">
                {`Square: (${position.left.toFixed(2)}, ${position.top.toFixed(2)}) | Sprite: (${spritePosition.left.toFixed(2)}, ${spritePosition.top.toFixed(2)})`}
            </div>
        );
    };

    const CollisionMessage = () => {
        return (
            <div className="collision-message">
                {collisionDetected ? "Collision detected!" : "No collision detected."}
            </div>
        );
    };

    const TimerDisplay = () => {
        return (
            <div className="timer">
                {`Current Time: ${currentTime.toLocaleTimeString()}`}
            </div>
        );
    };

    const startSpriteMoveTimer = () => {
        clearTimeout(spriteMoveTimeout.current);
        const interval = randomInterval();
        const elapsedTime = Date.now() - lastMoveTime;
        const adjustedInterval = Math.max(interval - elapsedTime, 0);

        spriteMoveTimeout.current = setTimeout(() => {
            moveSpriteRandomly();
        }, adjustedInterval);
    };

    useEffect(() => {
        const handleResize = () => {
            setPosition((prevPos) => ({
                top: Math.min(prevPos.top, window.innerHeight - SQUARE_SIZE),
                left: Math.min(prevPos.left, window.innerWidth - SQUARE_SIZE),
            }));
            setSpritePosition((prevPos) => ({
                top: Math.min(prevPos.top, window.innerHeight - SPRITE_SIZE),
                left: Math.min(prevPos.left, window.innerWidth - SPRITE_SIZE),
            }));
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove); // Add mouse move listener

        const animationLoop = () => {
            const distanceX = targetPosition.left - spritePosition.left;
            const distanceY = targetPosition.top - spritePosition.top;
            const distance = Math.hypot(distanceX, distanceY);

            if (distance > 1) {
                const directionX = distanceX / distance;
                const directionY = distanceY / distance;
                const moveDistance = SPEED * (Date.now() - lastMoveTime) / 1000;

                setSpritePosition((prevPos) => {
                    const newLeft = Math.min(Math.max(prevPos.left + directionX * moveDistance, 0), window.innerWidth - SPRITE_SIZE);
                    const newTop = Math.min(Math.max(prevPos.top + directionY * moveDistance, 0), window.innerHeight - SPRITE_SIZE);

                    return { left: newLeft, top: newTop };
                });

                setLastMoveTime(Date.now());
            }

            detectCollision(position, spritePosition, SQUARE_SIZE, SPRITE_SIZE);
            requestAnimationFrame(animationLoop);
        };

        const timeUpdateLoop = () => {
            setCurrentTime(new Date());
            requestAnimationFrame(timeUpdateLoop);
        };

        startSpriteMoveTimer();
        requestAnimationFrame(animationLoop);
        requestAnimationFrame(timeUpdateLoop);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove); // Clean up mouse move listener
            clearTimeout(spriteMoveTimeout.current);
        };
    }, [position, spritePosition, targetPosition]);

    return (
        <div className="container">
            <div className="score">{`Score: ${score}`}</div>
            <CoordinatesDisplay />
            <CollisionMessage />
            <TimerDisplay />
            <div
                className="square"
                style={{ top: `${position.top}px`, left: `${position.left}px` }}
            ></div>
            <div
                className="sprite"
                style={{ top: `${spritePosition.top}px`, left: `${spritePosition.left}px` }}
            ></div>
        </div>
    );
};

export default App;
