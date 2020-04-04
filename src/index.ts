import {select} from "d3-selection"
import {drag} from "d3-drag"
import {event} from "d3-selection"
import {Selection} from "d3-selection"
export async function chart(
    targetElementSelector:string,
    bodyImageURL: string,
    xAxisTopImageURL: string|null,
    xAxisBottomImageURL: string|null,
    yAxisLeftImageURL: string|null,
    yAxisRightImageURL: string|null) 
{
    type SVGSelection = Selection<SVGSVGElement, any, HTMLElement, any>
    class Wrappable {
        svg: SVGSelection;
        startDraggers: (() => void)[]
        doDraggers: (() => void)[]
        constructor(imageSrc: string, public width: number, public height: number, public horizontal: boolean, public vertical: boolean) {
            const svg = select(targetElementSelector).append('svg')
                .style('position','absolute')
                .attr('viewBox',`0 0 ${width} ${height}`)
                .attr('width',width)
                .attr('height',height)
                .call(drag()
                        .on('start',_=>this.startDraggers.forEach(f=>f()))
                        .on('drag',_=>this.doDraggers.forEach(f=>f())))
            const offsets:Array<{x:number,y:number}> = []
            for (let j = 0; j < 3; j++) {
                for (let i = 0; i < 3; i++) {
                    offsets.push({x:0,y:0})
                    const img = svg.append('svg:image')
                        .attr('x', -width+i*width)
                        .attr('width', width)
                        .attr("xlink:href", imageSrc)
                        .attr('y',-height + j*height)
                }
            }
            this.startDraggers = [() =>
                svg.selectAll('image')
                    .each(function(_,i) {
                        const t = select(this);
                        offsets[i].x = event.x - Number(t.attr('x'))
                        offsets[i].y = event.y - Number(t.attr('y'))
                    })
            ];
            this.doDraggers = [()=>
                svg.selectAll('image')
                    .each(function(o,i) {
                        if(horizontal){
                            let x = event.x-offsets[i].x
                            if (x < -width) x += 3*width;
                            if (x > width) x -= 3*width;
                            select(this).attr('x',x)
                        }
                        if(vertical) {
                            let y = event.y-offsets[i].y
                            if (y < -height) y += 3*height;
                            if (y > height) y -= 3*height;
                            select(this).attr('y',y)
                        }
                    })]
            this.svg = svg;
        }
        connect(b: Wrappable) {
            this.startDraggers.push(b.startDraggers[0])
            this.doDraggers.push(b.doDraggers[0])
        }
        left(value:number) {
            this.svg.style('left',value+'px');
        }
        top(value:number) {
            this.svg.style('top',value+'px');
        }
    }
    async function add(imgSrc:string|null, horizontal: boolean, vertical: boolean) {
        const { width, height } = await new Promise<{
            width: number
            height: number
        }>((resolve, reject) => {
            if (imgSrc) {
                var img = document.createElement('img')
                img.onload = () => {
                    resolve({ width: img.width, height: img.height })
                    img.remove()
                }
                img.src = imgSrc
            }
            else
                resolve({ width: 0, height: 0 })
        })
        return new Wrappable(imgSrc, width, height, horizontal, vertical)
    }
    const connect = (a: Wrappable,b: Wrappable) => {
        a.connect(b);
        b.connect(a);
    }
    const axisX = await add(xAxisTopImageURL,true,false);
    const axisY = await add(yAxisLeftImageURL,false,true);
    const body = await add(bodyImageURL,true,true)
    axisX.left(axisY.width)
    axisY.left(0)
    axisY.top(axisX.height)
    body.left(axisY.width)
    body.top(axisX.height)
    connect(axisX,body)
    connect(axisY,body)
    const axisYR = await add(yAxisRightImageURL,false,true)
    axisYR.left(axisY.width+body.width);
    axisYR.top(axisX.height);
    connect(axisYR,body);
    connect(axisYR,axisY);
    const axisXB = await add(xAxisBottomImageURL,true,false)
    axisXB.left(axisY.width)
    axisXB.top(axisX.height+body.height)
    connect(axisXB,body);
    connect(axisXB,axisX);
    select(targetElementSelector).style('height',(axisX.height+body.height+axisXB.height)+'px').style('position','relative')
}