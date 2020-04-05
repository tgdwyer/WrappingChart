"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
function chart(targetElementSelector, bodyImageURL, xAxisTopImageURL, xAxisBottomImageURL, yAxisLeftImageURL, yAxisRightImageURL) {
    return __awaiter(this, void 0, void 0, function () {
        function add(imgSrc, horizontal, vertical) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, width, height;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
                                if (imgSrc) {
                                    var img = document.createElement('img');
                                    img.onload = function () {
                                        resolve({ width: img.width, height: img.height });
                                        img.remove();
                                    };
                                    img.src = imgSrc;
                                }
                                else
                                    resolve({ width: 0, height: 0 });
                            })];
                        case 1:
                            _a = _b.sent(), width = _a.width, height = _a.height;
                            return [2 /*return*/, new Wrappable(imgSrc, width, height, horizontal, vertical)];
                    }
                });
            });
        }
        var element, Wrappable, connect, promises, top, left, body, right, bottom;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    element = document.getElementById(targetElementSelector);
                    if (!element)
                        return [2 /*return*/];
                    Wrappable = /** @class */ (function () {
                        function Wrappable(imageSrc, width, height, horizontal, vertical) {
                            var _this = this;
                            this.width = width;
                            this.height = height;
                            this.horizontal = horizontal;
                            this.vertical = vertical;
                            var svg_ = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                            svg_.style.position = 'absolute';
                            svg_.setAttribute('viewBox', "0 0 " + width + " " + height);
                            svg_.setAttribute('width', String(width));
                            svg_.setAttribute('height', String(height));
                            var dragging = false;
                            svg_.onmousedown = function (e) { dragging = true; _this.startDraggers.forEach(function (f) { return f(e.offsetX, e.offsetY); }); };
                            svg_.onmousemove = function (e) { return dragging && _this.doDraggers.forEach(function (f) { return f(_this, e.offsetX, e.offsetY); }); };
                            svg_.onmouseup = function (e) { return dragging = false; };
                            element.appendChild(svg_);
                            var offsets = [];
                            var images = [];
                            for (var j = 0; j < 3; j++) {
                                for (var i = 0; i < 3; i++) {
                                    var svgimg = document.createElementNS('http://www.w3.org/2000/svg', 'image');
                                    if (imageSrc)
                                        svgimg.setAttribute('href', imageSrc);
                                    svgimg.setAttribute('width', String(width));
                                    svgimg.setAttribute('height', String(height));
                                    svgimg.setAttribute('x', String(-width + i * width));
                                    svgimg.setAttribute('y', String(-height + j * height));
                                    svgimg.setAttribute('visibility', 'visible');
                                    svg_.appendChild(svgimg);
                                    images.push(svgimg);
                                    offsets.push({ x: 0, y: 0 });
                                }
                            }
                            this.startDraggers = [function (x, y) {
                                    return images.forEach(function (img, i) {
                                        offsets[i].x = x - Number(img.getAttribute('x'));
                                        offsets[i].y = y - Number(img.getAttribute('y'));
                                    });
                                }
                            ];
                            this.doDraggers = [function (s, ex, ey) {
                                    return images.forEach(function (img, i) {
                                        if (_this.horizontal && s.horizontal) {
                                            var x = ex - offsets[i].x;
                                            if (x < -width)
                                                x += 3 * width;
                                            if (x > width)
                                                x -= 3 * width;
                                            img.setAttribute('x', String(x));
                                        }
                                        if (_this.vertical && s.vertical) {
                                            var y = ey - offsets[i].y;
                                            if (y < -height)
                                                y += 3 * height;
                                            if (y > height)
                                                y -= 3 * height;
                                            img.setAttribute('y', String(y));
                                        }
                                    });
                                }];
                            this.svg = svg_;
                        }
                        Wrappable.prototype.connect = function (b) {
                            this.startDraggers.push(b.startDraggers[0]);
                            this.doDraggers.push(b.doDraggers[0]);
                        };
                        Wrappable.prototype.left = function (value) {
                            this.svg.style.left = String(value + 'px');
                        };
                        Wrappable.prototype.top = function (value) {
                            this.svg.style.top = String(value + 'px');
                        };
                        return Wrappable;
                    }());
                    connect = function (a, b) {
                        a.connect(b);
                        b.connect(a);
                    };
                    promises = {
                        top: add(xAxisTopImageURL, true, false),
                        left: add(yAxisLeftImageURL, false, true),
                        body: add(bodyImageURL, true, true),
                        right: add(yAxisRightImageURL, false, true),
                        bottom: add(xAxisBottomImageURL, true, false)
                    };
                    return [4 /*yield*/, promises.top];
                case 1:
                    top = _a.sent();
                    return [4 /*yield*/, promises.left];
                case 2:
                    left = _a.sent();
                    return [4 /*yield*/, promises.body];
                case 3:
                    body = _a.sent();
                    return [4 /*yield*/, promises.right];
                case 4:
                    right = _a.sent();
                    return [4 /*yield*/, promises.bottom];
                case 5:
                    bottom = _a.sent();
                    top.left(left.width);
                    left.left(0);
                    left.top(top.height);
                    body.left(left.width);
                    body.top(top.height);
                    connect(top, body);
                    connect(left, body);
                    right.left(left.width + body.width);
                    right.top(top.height);
                    connect(right, body);
                    connect(right, left);
                    bottom.left(left.width);
                    bottom.top(top.height + body.height);
                    connect(bottom, body);
                    connect(bottom, top);
                    element.style.position = 'relative';
                    element.style.width = String(left.width + body.width + right.width) + 'px';
                    element.style.height = String(top.height + body.height + bottom.height) + 'px';
                    return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=wrapchart.js.map