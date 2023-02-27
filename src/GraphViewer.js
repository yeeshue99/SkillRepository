import cytoscape from "cytoscape";
import cydagre from "cytoscape-dagre";
import dagre from "dagre";
import React, { useRef, useEffect } from "react";
import { defaults } from "./defaults";
import { style } from "./styles";
import "./root.css"
import "./GraphViewer.css";

cydagre(cytoscape, dagre);

export function TopologyViewerComponent({ elements }) {
    const ref = useRef(null);
    useEffect(() => {
        const cy = cytoscape({
            container: ref.current,
            boxSelectionEnabled: false,
            autounselectify: true,
            layout: {
                name: "dagre",
                ...defaults
            },
            zoom: 1,
            pan: { x: 0, y: 0 },
            minZoom: 0.1,
            maxZoom: 5,
            // wheelSensitivity: 0.1,
            motionBlur: false,
            motionBlurOpacity: 0.5,
            pixelRatio: "auto",
            textureOnViewport: false,
            style,
            elements
        });

        cy.on("tap", function (e) {
            const url = e.target.data("url");
            if (url && url !== "") {
                window.open(url);
            }
        });

        const animateEdges = () => {
            cy.edges().style({ "line-dash-offset": 0 });
            cy.edges().animate({
                style: {
                    "line-dash-offset": -300
                },
                duration: 5000,
                complete: () => animateEdges()
            });
        };

        animateEdges();

        return function cleanup() {
            if (cy) {
                cy.destroy();
            }
        };
    });
    return <div className="topology-viewer-component" ref={ref}></div>;
};

// export default TopologyViewerComponent;