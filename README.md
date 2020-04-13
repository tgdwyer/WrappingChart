# WrappingChart
[![Compose Wrapping charts from images](WrapChart.gif)](https://ialab.it.monash.edu/~dwyer/WrappingChart)
```
npm install
npm build
```
then open ```index.html``` in your browser for examples.

## Using in a web page:
Make a chart that wraps around in D3, Excel, Powerpoint, Illustrator.  Optionally, you can also make images for the top/bottom horizontal axes and the left/right vertical axes, for example, by screen-shotting the chart.  Their dimensions (in pixels) should precisely match the dimensions of the chart image.

To use in a web page, just create a div with a unique id somewhere in your page and source the script:
```
<script src="wrapchart.js"></script>
<div id="ChartDiv"></div>
```
Then call the ```wrapChart``` function to populate the div with a wrap chart constructed from the specified images:
```
<script>
    wrapChart("ChartDiv",
        "wrappablenswtraffic.png",
        "wrappablenswtraffic-xaxis-top.png",
        "wrappablenswtraffic-xaxis.png",
        "wrappablenswtraffic-yaxis.png",
        "wrappablenswtraffic-yaxis.png")
</script>
```
Where the images will be used for the body of the chart and the axes labels on each side, as follows:
```
function wrapChart(
    targetElementSelector:string,
    bodyImageURL: string,
    xAxisTopImageURL: string|null,
    xAxisBottomImageURL: string|null,
    yAxisLeftImageURL: string|null,
    yAxisRightImageURL: string|null,
    panConstraint: Constraint|undefined) 
```
It assumes that axes images are sized correctly for the body image, i.e. that x Axes are the same width as the body, and that y-axes are the same height as the body.

Note that you can specify ```null``` instead of an image for any of the axes labels and they will simply be omitted from the chart.
The last argument ```panConstraint``` can be left off, or specified as one of:
```
type Constraint = "horizontal" | "vertical" | "diagonal" | "antidiagonal"
```

If specified, this limits panning to a particular direction.
