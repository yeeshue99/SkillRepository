export const defaults = {
    // dagre algo options, uses default value on undefined
    nodeSep: 50, // the separation between adjacent nodes in the same rank
    edgeSep: undefined, // the separation between adjacent edges in the same rank
    rankSep: 300, // the separation between each rank in the layout
    rankDir: "TB", // 'TB' for top to bottom flow, 'LR' for left to right,
    ranker: "network-simplex", // Type of algorithm to assign a rank to each node in the input graph. Possible values: 'network-simplex', 'tight-tree' or 'longest-path'
    //'network-simplex', 'tight-tree' or 'longest-path'
    minLen: function (edge) {
        return 1;
    }, // number of ranks to keep between the source and target of the edge
    edgeWeight: function (edge) {
        return 1;
    }, // higher weight edges are generally made shorter and straighter than lower weight edges

    // general layout options
    fit: true, // whether to fit to viewport
    padding: 15, // fit padding
    spacingFactor: 1, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
    nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node
    animate: false, // whether to transition the node positions
    animateFilter: function (node, i) {
        return true;
    }, // whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
    animationDuration: 5000, // duration of animation in ms if enabled
    animationEasing: "ease-out-expo", // easing of animation if enabled
    boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
    transform: function (node, pos) {
        return pos;
    }, // a function that applies a transform to the final node position
    ready: function () { }, // on layoutready
    stop: function () { }, // on layoutstop
};
