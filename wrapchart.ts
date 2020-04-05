export async function chart(
    targetElementSelector:string,
    bodyImageURL: string,
    xAxisTopImageURL: string|null,
    xAxisBottomImageURL: string|null,
    yAxisLeftImageURL: string|null,
    yAxisRightImageURL: string|null) 
{
    const element = document.getElementById(targetElementSelector);
    if(!element) return;
    element.style.position = 'relative';
    
    class Wrappable {
        svg: SVGSVGElement;
        startDraggers: ((x:number,y:number) => void)[]
        doDraggers: ((x:number,y:number) => void)[]
        constructor(imageSrc: string|null, public width: number, public height: number, public horizontal: boolean, public vertical: boolean) {
            const svg_ = document.createElementNS('http://www.w3.org/2000/svg','svg');
            svg_.style.position = 'absolute';
            svg_.setAttribute('viewBox',`0 0 ${width} ${height}`)
            svg_.setAttribute('width',String(width))
            svg_.setAttribute('height',String(height))
            let dragging = false;
            svg_.onmousedown=ev=>{dragging = true; this.startDraggers.forEach(f=>f(ev.offsetX,ev.offsetY))};
            svg_.onmousemove=ev=>dragging && this.doDraggers.forEach(f=>f(ev.offsetX,ev.offsetY));
            svg_.onmouseup=ev=>dragging = false;
            element!.appendChild(svg_);
            const offsets:Array<{x:number,y:number}> = []
            const images:Array<SVGImageElement> = []
            for (let j = 0; j < 3; j++) {
                for (let i = 0; i < 3; i++) {
                    var svgimg = document.createElementNS('http://www.w3.org/2000/svg','image');
                    if (imageSrc) svgimg.setAttribute('href', imageSrc);
                    svgimg.setAttribute('width',String(width));
                    svgimg.setAttribute('height',String(height));
                    svgimg.setAttribute('x',String(-width + i*width));
                    svgimg.setAttribute('y',String(-height + j*height));
                    svgimg.setAttribute( 'visibility', 'visible');
                    svg_.appendChild(svgimg);
                    images.push(svgimg);
                    offsets.push({x:0,y:0})
                }
            }
            this.startDraggers = [(x:number,y:number) =>
                images.forEach((img,i)=>{
                    offsets[i].x = x - Number(img.getAttribute('x'))
                    offsets[i].y = y - Number(img.getAttribute('y'))
                })
            ];
            this.doDraggers = [(ex:number,ey:number)=>
                images.forEach((img,i)=>{
                    if(horizontal){
                        let x = ex-offsets[i].x
                        if (x < -width) x += 3*width;
                        if (x > width) x -= 3*width;
                        img.setAttribute('x',String(x))
                    }
                    if(vertical) {
                        let y = ey-offsets[i].y
                        if (y < -height) y += 3*height;
                        if (y > height) y -= 3*height;
                        img.setAttribute('y',String(y))
                    }
                })]
            this.svg = svg_;
        }
        connect(b: Wrappable) {
            this.startDraggers.push(b.startDraggers[0])
            this.doDraggers.push(b.doDraggers[0])
        }
        left(value:number) {
            this.svg.style.left = String(value+'px');
        }
        top(value:number) {
            this.svg.style.top = String(value+'px');
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
    const axisX = await add(xAxisTopImageURL,true,false)
    const axisY = await add(yAxisLeftImageURL,false,true)
    const body = await add(bodyImageURL,true,true)
    const axisYR = await add(yAxisRightImageURL,false,true)
    const axisXB = await add(xAxisBottomImageURL,true,false)
    axisX.left(axisY.width)
    axisY.left(0)
    axisY.top(axisX.height)
    body.left(axisY.width)
    body.top(axisX.height)
    connect(axisX,body)
    connect(axisY,body)
    axisYR.left(axisY.width+body.width);
    axisYR.top(axisX.height);
    connect(axisYR,body);
    connect(axisYR,axisY);
    axisXB.left(axisY.width)
    axisXB.top(axisX.height+body.height)
    connect(axisXB,body);
    connect(axisXB,axisX);
    
    element.style.width = String(axisY.width+body.width+axisYR.width)+'px';
    element.style.height = String(axisX.height+body.height+axisXB.height)+'px';
}