"use client"

import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const LayeredAnimation = () => {
    return (
        <div style={{
            width: "100vw",
            height: "100vh",
            position: "absolute",
            zIndex: -10,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: "hidden",
        }}>
            <DotLottieReact
                src="/assets/animation.json"
                loop
                autoplay
                useFrameInterpolation={false}
                className="home-animation-container"
            />
        </div>

    )
};

export default LayeredAnimation;
