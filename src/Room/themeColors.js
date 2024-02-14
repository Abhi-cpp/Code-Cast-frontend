const colors = [
    { value: 'github', label: 'Github', mainColor: "fffff", fontColor: "white" },
    { value: 'cobalt', label: 'Cobalt', mainColor: "fffff", fontColor: "white" },
    { value: 'dracula', label: 'Dracula', mainColor: "fffff", fontColor: "white" },
    { value: 'monokai', label: 'Monokai', mainColor: "fffff", fontColor: "white" },
    { value: 'xcode', label: 'Xcode', mainColor: "fffff" },
    { value: 'terminal', label: 'Terminal', mainColor: "fffff", fontColor: "white" },
    { value: 'tomorrow_night', label: 'Tomorrow Night', mainColor: "fffff", fontColor: "white" },
    { value: 'solarized_dark', label: 'Solarized Dark', mainColor: "fffff", fontColor: "white" },
    { value: 'vibrant_ink', label: 'Vibrant Ink', mainColor: "#0f0f0f", fontColor: "white" },
    { value: 'one_dark', label: 'One Dark', mainColor: "#282c34", fontColor: "white" }
]

function getColor(theme) {
    let backColor = colors.find((option) => option.value === theme).mainColor;
    let fontColor = colors.find((option) => option.value === theme).fontColor;
    return { backColor, fontColor }
}

export default getColor;