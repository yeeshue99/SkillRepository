import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";
import React, { useRef, useEffect, useState } from "react";
import { defaults } from "./defaults";
import { calculateStyle } from "./styles";
import "./root.css"
import "./GraphViewer.css";


cytoscape.warnings(false);
cytoscape.use(dagre);

const createGraphElements = (skillGroups, selectedArchetype) => {
    let nodes = Object.entries(skillGroups).filter((item) => item[0] === selectedArchetype).map(([, skills]) => (
        skills.map((skill) => (
            {
                data: {
                    id: skill.name,
                    label: skill.name,
                    callCount: 10,
                    delayMS: 100,
                },
                classes: "node",
            }
        ))))

    let edges = Object.entries(skillGroups).filter((item) => item[0] === selectedArchetype).map(([, skills]) => (
        skills.filter((skill) => skill.prerequisite !== "None").map((skill) => {
            if (skill.prerequisite.includes(",")) {
                let prereqs = skill.prerequisite.split(", ");
                return prereqs.map((prereq) => {
                    return {
                        data: {
                            // id: skill.name + prereq,
                            source: prereq,
                            target: skill.name,
                            callCount: 10,
                            delayMS: 100,
                            speed: 100,
                            bw: 50
                        },
                    }
                })
            }
            else {
                return {
                    data: {
                        // id: skill.name + skill.prerequisite,
                        source: skill.prerequisite,
                        target: skill.name,
                        callCount: 10,
                        delayMS: 100,
                        speed: 100,
                        bw: 50
                    },
                }
            }
        })))

    nodes = [...nodes[0]];

    edges = edges.flat().flat();

    return { nodes: nodes, edges: edges }
}

export function TopologyViewerComponent({ skillGroups, selectedArchetype, colorScheme }) {
    const ref = useRef(null);
    const [graphData, setGraphData] = useState(() => {
        const saved = localStorage.getItem("graphData");
        const initialValue = JSON.parse(saved);
        return initialValue || {};
    });

    useEffect(() => {

        const elements = createGraphElements(skillGroups, selectedArchetype);

        console.log("Rendering graph...", colorScheme)

        let style = calculateStyle(colorScheme)

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
            wheelSensitivity: 0.1,
            motionBlur: false,
            motionBlurOpacity: 0.5,
            pixelRatio: "auto",
            textureOnViewport: false,
            style,
            elements
        });

        if (graphData.hasOwnProperty(selectedArchetype)) {
            console.log(graphData[selectedArchetype])
            cy.elements().remove();
            cy.add(graphData[selectedArchetype]).layout({ name: 'preset' }).run();
        }

        // cy.json({ style: style });

        // cy.on("tap", function (e) {
        //     const url = e.target.data("url");
        //     if (url && url !== "") {
        //         window.open(url);
        //     }
        // });

        cy.on('free', 'node', function (evt) {
            setGraphData({ ...graphData, [selectedArchetype]: { nodes: cy.nodes().jsons(), edges: cy.edges().jsons() } });
            localStorage.setItem("graphData", JSON.stringify({ ...graphData, [selectedArchetype]: { nodes: cy.nodes().jsons(), edges: cy.edges().jsons() } }));

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
    }, [selectedArchetype, skillGroups, colorScheme, graphData]);
    return <div className="topology-viewer-component" ref={ref}></div>;
};

// export default TopologyViewerComponent;