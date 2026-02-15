import { default as palette } from "tailwindcss/colors";

function withOpacityValue(variable) {
    return ({ opacityValue }) => {
        if (opacityValue === undefined) {
            return `rgb(var(${variable}))`;
        }
        return `rgb(var(${variable}) / ${opacityValue})`;
    };
}

const neutral = palette.neutral;

const mainPalette = {};
Object.keys(neutral).forEach((shade) => {
    mainPalette[shade] = withOpacityValue(`--color-main-${shade}`);
});

export const theme = {
    extend: {
        colors: {
            main: mainPalette,
        },
    },
};
export const plugins = [];
