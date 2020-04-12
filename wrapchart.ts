type Constraint = "horizontal" | "vertical" | "diagonal" | "antidiagonal"
async function chart(
    targetElementSelector:string,
    bodyImageURL: string,
    xAxisTopImageURL: string|null,
    xAxisBottomImageURL: string|null,
    yAxisLeftImageURL: string|null,
    yAxisRightImageURL: string|null,
    panConstraint: Constraint|undefined) 
{
    const element = document.getElementById(targetElementSelector);
    if(!element) return;
    class Wrappable {
        svg: SVGSVGElement;
        startDraggers: ((x:number, y:number) => void)[]
        doDraggers: ((s:Wrappable, x:number, y:number) => void)[]
        constructor(imageSrc: string|null, public width: number, public height: number, public horizontal: boolean, public vertical: boolean) {
            this.svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
            this.svg.style.position = 'absolute';
            this.svg.setAttribute('viewBox',`0 0 ${width} ${height}`)
            this.svg.setAttribute('width',String(width))
            this.svg.setAttribute('height',String(height))
            makeDraggable(this.svg,(x,y)=>this.startDraggers.forEach(f=>f(x,y)),(x,y)=>this.doDraggers.forEach(f=>f(this,x,y)));
            element!.appendChild(this.svg);
            const offsets:Array<{x:number,y:number}> = []
            const images:Array<SVGImageElement> = [] 
            for (let j = 0; j < 3; j++) {
                for (let i = 0; i < 3; i++) {
                    const img = document.createElementNS('http://www.w3.org/2000/svg','image');
                    if (imageSrc) img.setAttribute('href', imageSrc);
                    img.setAttribute('width',String(width));
                    img.setAttribute('height',String(height));
                    img.setAttribute('x',String(-width + i*width));
                    img.setAttribute('y',String(-height + j*height));
                    img.setAttribute( 'visibility', 'visible');
                    this.svg.appendChild(img);
                    images.push(img);
                    offsets.push({x:0,y:0})
                }
            }
            this.startDraggers = [(x:number,y:number) =>
                images.forEach((img,i)=>{
                    const diagonal = (x+y)/2; // scalar projection of x and y on diagonal vector (1,1)
                    const [ox,oy] = panConstraint === "diagonal" ? [(x+y)/2,(x+y)/2] : panConstraint === "antidiagonal" ? [-(y-x)/2,(y-x)/2] : [x,y];
                    offsets[i].x = ox - Number(img.getAttribute('x'))
                    offsets[i].y = oy - Number(img.getAttribute('y'))
                })
            ];
            this.doDraggers = [(s:Wrappable, ex:number,ey:number)=>
                images.forEach((img,i)=>{
                    const wrap = (v: number, d: number)=> v < -d ? v+3*d : v > d ? v-3*d : v;
                    if(!panConstraint || panConstraint === "horizontal" || panConstraint === "vertical"){
                        const x = wrap(ex-offsets[i].x,width),
                              y = wrap(ey-offsets[i].y,height);
                        if(this.horizontal&&s.horizontal&&panConstraint!=="vertical") img.setAttribute('x',String(x))
                        if(this.vertical&&s.vertical&&panConstraint!=="horizontal") img.setAttribute('y',String(y))
                    } else if (panConstraint === 'diagonal') { // diagonal takes only the projection of the drag on the diagonal vector (1,1)
                        const x = wrap((ex+ey)/2 - offsets[i].x,width),
                              y = wrap((ex+ey)/2 - offsets[i].y,height);
                        if(this.horizontal) img.setAttribute('x',String(x))
                        if(this.vertical) img.setAttribute('y',String(y))
                    } else { // antidiagonal, project on (-1,1)
                        const x = wrap(-(ey-ex)/2 - offsets[i].x,width),
                              y = wrap((ey-ex)/2 - offsets[i].y,height);
                        if(this.horizontal) img.setAttribute('x',String(x))
                        if(this.vertical) img.setAttribute('y',String(y))
                    }
                })]
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
    const connect = (a: Wrappable, b: Wrappable) => {
        a.connect(b);
        b.connect(a);
    }
    const promises = {
        top:add(xAxisTopImageURL,true,false),
        left:add(yAxisLeftImageURL,false,true),
        body:add(bodyImageURL,true,true),
        right:add(yAxisRightImageURL,false,true),
        bottom:add(xAxisBottomImageURL,true,false)
    }
    const top = await promises.top,
          left = await promises.left,
          body = await promises.body,
          right = await promises.right,
          bottom = await promises.bottom;
    top.left(left.width)
    left.left(0)
    left.top(top.height)
    body.left(left.width)
    body.top(top.height)
    connect(top,body)
    connect(left,body)
    right.left(left.width+body.width);
    right.top(top.height);
    connect(right,body);
    connect(right,left);
    bottom.left(left.width)
    bottom.top(top.height+body.height)
    connect(bottom,body);
    connect(bottom,top);
    if(panConstraint==="diagonal") {
        connect(left,top)
    }
    
    element.style.position = 'relative';
    element.style.width = String(left.width+body.width+right.width)+'px';
    element.style.height = String(top.height+body.height+bottom.height)+'px';

    
    function makeDraggable(s:SVGSVGElement, start:(x:number,y:number)=>void, drag:(x:number,y:number)=>void) {
        let dragging = false;
        let touchid = -1;
        s.onmousedown=e=>{dragging = true; start(e.offsetX,e.offsetY)};
        s.onmousemove=e=>dragging && drag(e.offsetX,e.offsetY);
        s.ontouchstart=e=>{
            e.preventDefault();
            const touch = e.changedTouches[0]; 
            touchid = touch.identifier; 
            start(touch.clientX,touch.clientY);
        }
        s.ontouchmove=e=>{
            e.preventDefault();
            let touch:any = null;
            for(let i = 0; i < e.touches.length; i++) { 
                if(e.touches[i].identifier === touchid) touch = e.touches[i];
            }
            if(touch) {
                drag(touch.clientX,touch.clientY);
            }
        }
        s.ontouchend = s.ontouchcancel = e=>touchid = -1;
        s.onmouseout = s.onmouseup = e=>dragging = false;
    }
}