import './root.css';

const COLORS = {
    "#evs-white": "#ffffff",
    "#evs-gray": "#323232",
    "#evs-info": "#00bcd4",
    "#evs-danger": "#f44336",
    "#evs-warning": "#ff9800",
    "#evs-success": "#4caf50",
    "#evs-primary": "#2196f3",
    "#evs-black": "#000000",
    "#evs-gray-lighter": "#696969",
    "#evs-gray-light": "#555555",
    "#evs-gray-darker": "#141414",
    "#evs-gray-dark": "#232323",
    "#amber-500": "#ffc107",
    "#purple-500": "#9c27b0",
    "#deeppurple-500": "#673ab7",
    "#indigo-500": "#3f51b5",
    "#lightblue-500": "#03a9f4",
    "#teal-500": "#009688",
    "#lightgreen-500": "#8bc34a",
    "#lime-500": "#cddc39",
    "#yellow-500": "#ffeb3b",
    "#pink-500": "#e91e63",
    "#deeporange-500": "#ff5722",
    "#brown-500": "#795548",
    "#bluegrey-500": "#607d8b",
    "#gray-500": "#9e9e9e",
    "#teal-700": "#00bfa5"
};

let backgroundColor = window.getComputedStyle(document.body, null).getPropertyValue('background-color');
let textColor = window.getComputedStyle(document.body, null).getPropertyValue('color');

export const style = [
    {
        selector: ".switch, .interface, .interface-problem",
        style: {
            "background-color": backgroundColor,
            "border-width": 5,
        }
    },
    {
        selector: ".switch",
        style: {
            width: 240,
            height: 160,
            "padding": 16,
            "border-color": COLORS["#evs-gray-light"],
            shape: "roundrectangle",
            "font-size": 40
        }
    },
    {
        selector: ".red",
        style: {
            "border-color": "#ee4326"
        }
    },
    {
        selector: ".blue",
        style: {
            "border-color": "#2643ee"
        }
    },
    {
        selector: ".purple",
        style: {
            "border-color": "#ee43ee"
        }
    },
    {
        selector: ".emerald",
        style: {
            "border-color": "#0eedcb"
        }
    },
    {
        selector: ".switch:selected",
        style: {
            "background-color": COLORS["#evs-info"]
        }
    },
    {
        selector: ".interface",
        style: {
            width: 54,
            height: 54,
            "font-size": 12,
            "border-color": COLORS["#teal-700"]
        }
    },
    {
        selector: ".interface-problem",
        style: {
            width: 54,
            height: 54,
            "font-size": 12,
            "border-color": COLORS["#evs-danger"]
        }
    },
    {
        selector: ".interface-problem:selected",
        style: {
            "background-color": COLORS["#evs-danger"]
        }
    },
    {
        selector: ".interface:selected",
        style: {
            "background-color": COLORS["#teal-700"]
        }
    },
    {
        selector: ":parent",
        style: {
            events: "yes",
            // "background-fill": "#FFFFFF", //radial-gradient
            "background-gradient-stop-colors": `${COLORS["#evs-gray"]} ${COLORS["#evs-gray-dark"]}`,
            "background-opacity": 0,
            "border-width": 0,
            "text-valign": "top",
            "text-halign": "left",
            shape: "roundrectangle"
        }
    },
    {
        selector: "[label]",
        style: {
            label: "data(label)",
            color: textColor,
            "text-valign": "center",
            "font-family": "Roboto",
            "text-wrap": "wrap",
            "text-max-width": 240,
            // "text-margin-y": -100,

        }
    },
    {
        selector: "edge",
        style: {
            "z-index": 999,
            opacity: 1,
            "curve-style": "bezier",
            "line-style": "dashed",
            "line-dash-pattern": [36, 1, 2, 1].map((e) => e * 5),
            "line-dash-offset": 0,
            width: 15,
            "target-arrow-shape": "triangle",
            "target-arrow-color": (ele) => {
                let pUsed = (ele.data("bw") / ele.data("speed")) * 100;
                if (pUsed > 80) {
                    return COLORS["#evs-warning"];
                } else if (pUsed > 30) {
                    return COLORS["#evs-success"];
                } else if (pUsed > 0) {
                    return COLORS["#evs-primary"];
                } else {
                    return COLORS["#evs-gray-light"];
                }
            }
        }
    },
    {
        selector: "[speed]",
        style: {
            "line-color": (ele) => {
                let pUsed = (ele.data("bw") / ele.data("speed")) * 100;
                if (pUsed > 80) {
                    return COLORS["#evs-warning"];
                } else if (pUsed > 30) {
                    return COLORS["#evs-success"];
                } else if (pUsed > 0) {
                    return COLORS["#evs-primary"];
                } else {
                    return COLORS["#evs-gray-light"];
                }
            },
            width: "mapData(speed, 0, 100, 1, 10)",
            "z-index": (ele) => Math.ceil((ele.data("bw") / ele.data("speed")) * 100),
            "line-dash-pattern": (ele) => {
                const f = 100 - Math.ceil((ele.data("bw") / ele.data("speed")) * 100);
                return [f, 2, 5, 2];
            }
        }
    }
];
