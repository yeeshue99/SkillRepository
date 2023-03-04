import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";
import React, { useRef, useEffect, useState } from "react";
import { defaults } from "./defaults";
import { calculateStyle } from "./styles";
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import popper from 'cytoscape-popper';
import "./root.css"
import "./GraphViewer.css";

cytoscape.warnings(false);
cytoscape.use(dagre);
cytoscape.use(popper);

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



export function TopologyViewerComponent({ skillGroups, selectedArchetype, colorScheme, showGraph, resetViewer, setResetViewer }) {
    const ref = useRef(null);
    const [graphData, setGraphData] = useState(() => {
        const saved = localStorage.getItem("graphData");
        const initialValue = JSON.parse(saved);
        return initialValue || {};
    });
    const [selected, setSelected] = useState(null);
    const [firstRender, setFirstRender] = useState(true);

    useEffect(() => {
        const elements = createGraphElements(skillGroups, selectedArchetype);
        let tip;

        let style = calculateStyle(colorScheme)

        if (resetViewer) {
            localStorage.removeItem("graphData");
            setGraphData({});
            setFirstRender(true);
            setResetViewer(false);
            setSelected(null);
            return;
        }

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
            elements,
        });

        if (graphData.hasOwnProperty(selectedArchetype)) {

            let generatedNodes = cy.nodes();
            let savedNodes = graphData[selectedArchetype].nodes;

            let generatedEdges = cy.edges();
            let savedEdges = graphData[selectedArchetype].edges;

            generatedNodes.forEach((generatedNode) => {
                let savedNode = savedNodes?.find((savedNode) => savedNode.data.id === generatedNode.data().id);
                if (savedNode) {
                    generatedNode.position(savedNode.position);
                }
            });

            generatedEdges.forEach((generatedEdge) => {
                let savedEdge = savedEdges?.find((savedEdge) => savedEdge.data.id === generatedEdge.data().id);
                if (savedEdge) {
                    generatedEdge.position(savedEdge.position);
                }
            });
        }

        if (firstRender) {
            cy.fit([], 50);
            let graphObject = {
                ...graphData,
                [selectedArchetype]: {
                    ...graphData[selectedArchetype],
                }
            }
            setGraphData(graphObject);
            localStorage.setItem("graphData", JSON.stringify(graphObject));
        }

        const saveGraphData = () => {
            let graphObject = {
                ...graphData,
                [selectedArchetype]: {
                    nodes: cy.nodes().jsons(),
                    edges: cy.edges().jsons(),
                }
            }
            let isEqual = true;

            //Check nodes
            for (var nodeIndex = 0; nodeIndex < graphObject[selectedArchetype].nodes.length; nodeIndex++) {
                if (graphObject[selectedArchetype].nodes[nodeIndex].position.x !== graphData[selectedArchetype].nodes[nodeIndex].position.x) {
                    isEqual = false;
                    break;
                }
            }

            setGraphData(graphObject);
            localStorage.setItem("graphData", JSON.stringify(graphObject));

            if (isEqual) return;

            setSelected(null);
        }

        cy.off('free');

        cy.on('free', 'node', function (evt) {
            saveGraphData();
        });

        cy.off('tap');

        cy.on('tap', 'node', function (evt) {
            // console.log(evt);
            setSelected(this);
            // console.log(selected);
        });

        if (selected) {
            let nodeRef = selected.popperRef();
            let dummyDomEle = document.createElement('div');

            let skillRef = skillGroups[selectedArchetype].find((skill) => skill.name === selected.id());

            if (skillRef) {
                tip = new tippy(dummyDomEle, {
                    getReferenceClientRect: nodeRef.getBoundingClientRect,
                    trigger: 'manual',

                    content: () => {
                        let content = document.createElement('div');

                        content.innerHTML = skillRef?.description;

                        return content;
                    }
                });

                tip.show();
            }
            else {
                tip?.hide();
            }
        }

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

        setFirstRender(false);

        return function cleanup() {
            if (cy) {
                cy.destroy();
            }
        };
    }, [selectedArchetype, skillGroups, colorScheme, graphData, selected, firstRender, showGraph, resetViewer, setResetViewer]);
    return <div className="topology-viewer-component" ref={ref}></div>;
};

// export default TopologyViewerComponent;