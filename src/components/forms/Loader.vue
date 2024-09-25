<template>
    <ul>
        <li><Icon icon="loader-1"/></li>
        <li><Icon icon="loader-2"/></li>
    </ul>
</template>

<style lang="scss" scoped>
    ul {
        list-style: none;
        padding: 0;
        margin: 0;
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        pointer-events: none;
        // filter: blur(2px);

        &:before {
            position: absolute;
            content: '';
            background-image: url(/img/bg.svg);
            background-size: 140px;
            background-position: center;
            // animation: bg-loader infinite 10s;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            filter: blur(3px);
            // opacity: .3;
        }

        &:after {
            position: absolute;
            animation: we-loader infinite 20s;
            content: "";
            background-image: url(/img/we.svg);
            fill: var(--Color-primary-black);
            background-size: 60%;
            background-position: center;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            // filter: blur(1px);
        }

        @keyframes bg-loader {
            0% {
                background-position-x: 0%;
                background-position-y: 0%;
            }
            50% { 
                background-position-x: 50%;
                background-position-y: 50%;
            }
            100% { 
                background-position-x: 0%;
                background-position-y: 0%;
            }
        }

        @keyframes we-loader {
            0% {
                background-position-x: 0%;
                background-position-y: 0%;
            }
            100% { 
                background-position-x: 100%;
                background-position-y: 100%;
            }
        }

        li {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2;
            svg {
                width: 120px;
                height: auto;
                fill: $turquoise;
                animation: svg 16s infinite;
            }

            &:nth-child(2) {
                svg {
                    animation: svg 14s infinite;
                    fill: $off-red;
                }
            }
        }

        &.light {
            background-color: $black-1;
            &:before {
                display: none;
            }

            &:after {
                background-size: 30px;
                transform: rotate(339deg);
                transform-origin: center;
                left: -100%;
                right: -100%;
                top: -100%;
                bottom: -100%;
                animation: we-loader infinite 20s;
            }

            li {
                svg {
                    width: 40px;
                }
            }
        }
    }

    @keyframes svg {
        0% {
            opacity: 0.5;
            transform: rotate(0deg);
        }
        10% {
            opacity: 1;
            transform: rotate(40deg);
        }
        50% {
            opacity: .95;
            transform: rotate(180deg);
        }
        90% {
            opacity: 1;
            transform: rotate(280deg);
        }
        100% {
            opacity: 0.5;
            transform: rotate(360deg);
        }
    }
</style>












