import { useState } from "react";
import { Renderer } from "./Renderer";
import { Tooltip } from "./Tooltip";
import { COLOR_LEGEND_HEIGHT } from "./constants";
import { ColorLegend } from "./ColorLegend";
import * as d3 from "d3";
import { COLORS, THRESHOLDS } from "./constants";

/**
 * Renders a heatmap from a dataset.
 *
 * @param {{ width: number, height: number, data: Dataset }} props
 * - width: The width of the chart
 * - height: The height of the chart
 * - data: The dataset to render
 * @returns {JSX.Element} The rendered heatmap
 */
export const Heatmap = ({ width, height, data, }) => {
    const [hoveredCell, setHoveredCell] = useState(null);


    const values = data.map((d) => d.value);
    const min = d3.min(values) || 0;
    const max = d3.max(values) || 0;

    const colorScale = d3.scaleSequential()
        .domain([min, max])
        .interpolator(d3.interpolateBlues);

    const totalPnL = values.reduce((a, b) => a + b, 0); 

    return (
        <div style={{ position: "relative", }}>
            <Renderer
                width={width}
                height={height - COLOR_LEGEND_HEIGHT}
                data={data}
                setHoveredCell={setHoveredCell}
                colorScale={colorScale}
            />
            <Tooltip
                interactionData={hoveredCell}
                width={width}
                height={height - COLOR_LEGEND_HEIGHT}
            />
            <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                <ColorLegend
                    height={COLOR_LEGEND_HEIGHT}
                    width={250}
                    colorScale={colorScale}
                    interactionData={hoveredCell}
                    totalPnL={totalPnL}
                />
            </div>
        </div>
    );
};
