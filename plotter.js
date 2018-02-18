/**
 * Created by Erfan on 8/10/2016.
 * erfan.shamabadi.com
 */

var Parser = require('expr-eval').Parser;
var Konva = require('konva');

global.Plotter = Plotter;

// Plotter class
function Plotter(canvasId, width, height, ranges) {

    // const
    this.gridColor = 'gray';

    this.plots = [];

    this.width = width;
    this.height = height;

    this.stage = new Konva.Stage({
        container: canvasId,
        width: width,
        height: height
    });

    this.staticLayer = new Konva.Layer({hitGraphEnabled: false});
    this.stage.add(this.staticLayer);

    this.plotsLayer = new Konva.Layer({draggable: true});
    this.stage.add(this.plotsLayer);

    this._initialRanges = ranges;

    this.setWindow(ranges.minX, ranges.maxX, ranges.minY, ranges.maxY, true);
    this._drawBg();
    this._drawBorder();
    this.drawAxes();

    var self = this;
    // drag
    this.stage.on("dragend", function (e) {
        self.refresh();
    });

    this.plotsLayer.draw();
    this.staticLayer.draw();
}

Plotter.prototype.getContainer = function () {
    return this.stage.container;
};

// set window
Plotter.prototype.setWindow = function (minX, maxX, minY, maxY, fill) {

    if (fill) {
        var filledRanges = this._filledRanges(minX, maxX, minY, maxY, this.width, this.height);
        minX = filledRanges [0];
        maxX = filledRanges [1];
        minY = filledRanges [2];
        maxY = filledRanges [3];
    }

    var transformMatrix = this._transformMatrix(minX, maxX, minY, maxY, this.width, this.height);

    this.plotsLayer.scaleX(transformMatrix[0]);
    this.plotsLayer.scaleY(transformMatrix[3]);
    this.plotsLayer.offsetX(-transformMatrix[4] / transformMatrix[0]);
    this.plotsLayer.offsetY(-transformMatrix[5] / transformMatrix[3]);
};

Plotter.prototype.refresh = function () {
    this._drawBg();
    this.drawAxes();
    this._redrawPlots();

    this.plotsLayer.draw();
};

// draw axes
Plotter.prototype.drawAxes = function () {

    var ranges = this._ranges();

    var minX = ranges[0];
    var maxX = ranges[1];
    var minY = ranges[2];
    var maxY = ranges[3];

    var rangeX = maxX - minX;
    var rangeY = maxY - minY;

    // increase ranges for fluent view on drag
    minX -= rangeX;
    maxX += rangeX;
    minY -= rangeY;
    maxY += rangeY;

    function drawLine(layer, id, points, color, strokeSize, name) {
        var axis = layer.findOne("#" + id);
        if (axis) {
            axis.points(points);
            axis.strokeWidth(strokeSize);
        } else {
            axis = new Konva.Line({
                points: points,
                stroke: color,
                strokeWidth: strokeSize,
                id: id,
                name: name,
                listening: false,
                transformsEnabled: "none",
                strokeHitEnabled: false
            });
            layer.add(axis);
        }
    }

    var strokeSize = this._scaleSize(1);

    drawLine(this.plotsLayer, "xAxis", [minX, 0, maxX, 0], this.gridColor, strokeSize);
    drawLine(this.plotsLayer, "yAxis", [0, minY, 0, maxY], this.gridColor, strokeSize);

    function roundNumberOfDigits(number, decimal) {
        var roundLimitX = Math.pow(10, decimal);
        return Math.round(number / roundLimitX) * roundLimitX;
    }

    var counterLines = this.plotsLayer.find(".AxisCounter");
    counterLines.each(function (counterLine) {
        counterLine.destroy();
    });

    var counterLineSize = this._scaleSize(5);
    var fontSize = 12;
    var textHalfWidth = this._scaleSize(3);
    var minusDoubleCounterLineSize = -counterLineSize * 2;

    var stepX = rangeX / (this.width / 60);
    var numberOfDigitsX = Math.floor(Math.log10(stepX));
    stepX = roundNumberOfDigits(stepX, numberOfDigitsX);
    if (stepX == 0) {
        stepX = 1
    }

    var stepY = rangeY / (this.height / 60);
    var numberOfDigitsY = Math.floor(Math.log10(stepX));
    stepY = roundNumberOfDigits(stepY, numberOfDigitsY);
    if (stepY == 0) {
        stepY = 1
    }

    var fixNumber = numberOfDigitsX < 0 ? -numberOfDigitsX : 0;
    var i, numberText;
    // Draw counter lines on horizontal axis
    for (i = stepX; i <= maxX; i += stepX) {
        numberText = i.toFixed(fixNumber);
        drawLine(this.plotsLayer, "xAxis[" + numberText + "]", [i, -counterLineSize, i, counterLineSize], this.gridColor, strokeSize, "AxisCounter");
        this._writeMessage(this.plotsLayer, "xAxisNum[" + numberText + "]", i - numberText.length * textHalfWidth, minusDoubleCounterLineSize, numberText, this.gridColor, fontSize, "normal", "AxisCounter");
    }

    // Draw counter lines on horizontal axis
    for (i = -stepX; i >= minX; i -= stepX) {
        numberText = i.toFixed(fixNumber);
        drawLine(this.plotsLayer, "xAxis[" + numberText + "]", [i, -counterLineSize, i, counterLineSize], this.gridColor, strokeSize, "AxisCounter");
        this._writeMessage(this.plotsLayer, "xAxisNum[" + numberText + "]", i - numberText.length * textHalfWidth, minusDoubleCounterLineSize, numberText, this.gridColor, fontSize, "normal", "AxisCounter");
    }

    // Draw little lines on vertical axis
    for (i = stepY; i <= maxY; i += stepY) {
        numberText = i.toFixed(fixNumber);
        drawLine(this.plotsLayer, "yAxis[" + numberText + "]", [-counterLineSize, i, counterLineSize, i], this.gridColor, strokeSize, "AxisCounter");
        this._writeMessage(this.plotsLayer, "yAxisNum[" + numberText + "]", minusDoubleCounterLineSize - numberText.length * textHalfWidth * 2, i + textHalfWidth, numberText, this.gridColor, fontSize, "normal", "AxisCounter");
    }

    // Draw little lines on vertical axis
    for (i = -stepY; i >= minY; i -= stepY) {
        numberText = i.toFixed(fixNumber);
        drawLine(this.plotsLayer, "yAxis[" + numberText + "]", [-counterLineSize, i, counterLineSize, i], this.gridColor, strokeSize, "AxisCounter");
        this._writeMessage(this.plotsLayer, "yAxisNum[" + numberText + "]", minusDoubleCounterLineSize - numberText.length * textHalfWidth * 2, i + textHalfWidth, numberText, this.gridColor, fontSize, "normal", "AxisCounter");
    }
};

Plotter.prototype._writeMessage = function (layer, id, x, y, message, color, fontSize, fontStyle, name) {
    fontStyle = fontStyle || "normal";

    var text = layer.findOne("#" + id);
    if (text) {
        text.x(x);
        text.y(y);
        text.text(message);
        text.fontSize(fontSize);
        text.fill(color);
    } else {
        text = new Konva.Text({
            x: x,
            y: y,
            text: message,
            id: id,
            fontSize: fontSize,
            fontFamily: 'Calibri',
            fill: color,
            fontStyle: fontStyle,
            name: name,
            scaleX: 1 / layer.scaleX(),
            scaleY: 1 / layer.scaleY(),
            listening: false
        });
        layer.add(text);
    }
};

Plotter.prototype.plot = function (expression, color) {

    var expr = Parser.parse(expression);
    var points = this._calcPoints(expr);

    var plot = new Konva.Line({
        id: "plot" + this.plots.length,
        points: points,
        stroke: color,
        strokeWidth: this._scaleSize(2),
        draggable: false,
        transformsEnabled: "none",
        listening: false
    });

    this.plotsLayer.add(plot);
    this.plotsLayer.draw();

    this._addExpression(this.plots.length, expression, color);

    this.plots.push(expr);
};

Plotter.prototype._redrawPlots = function () {

    var strokeSize = this._scaleSize(2);

    for (var i = 0; i < this.plots.length; i++) {
        var plot = this.plotsLayer.findOne("#plot" + i);
        var expr = this.plots[i];
        var points = this._calcPoints(expr);
        plot.points(points);
        plot.strokeWidth(strokeSize);
    }
};

Plotter.prototype._calcPoints = function (expr) {
    var ranges = this._ranges();

    var minX = ranges[0],
        maxX = ranges[1],
        minY = ranges[2],
        maxY = ranges[3];

    var rangeX = maxX - minX;
    var rangeY = maxY - minY;

    var stepFine = this._scaleSize(0.05);
    var stepRough = this._scaleSize(1);

    var points = [];

    var limitMinY = minY - rangeY,
        limitMaxY = maxY + rangeY,
        limitMaxX = maxX + rangeX;

    var x, y;
    for (x = minX - rangeX; x < minX; x += stepRough) {
        y = expr.evaluate({x: x});
        if (limitMaxY < y || y < limitMinY) continue;
        points.push(x);
        points.push(y);
    }

    for (x = minX; x < maxX; x += stepFine) {
        y = expr.evaluate({x: x});
        if (limitMaxY < y || y < limitMinY) continue;
        points.push(x);
        points.push(y);
    }

    for (x = maxX; x <= limitMaxX; x += stepRough) {
        y = expr.evaluate({x: x});
        if (limitMaxY < y || y < limitMinY) continue;
        points.push(x);
        points.push(y);
    }

    return points;
};

Plotter.prototype._addExpression = function (plotNumber, expression, color) {
    this._writeMessage(this.staticLayer, "expression" + this.plots.length, 10, 20 * this.plots.length + 10, expression, color, 14, "bold", "expression");
    this.staticLayer.draw();
};

Plotter.prototype.clear = function () {
    for (var i = 0; i < this.plots.length; i++) {
        var plot = this.plotsLayer.findOne("#plot" + i);
        plot.destroy();
        var expression = this.staticLayer.findOne("#expression" + i);
        expression.destroy();
    }
    this.plots = [];

    this.refresh();
    this.staticLayer.draw();
};

Plotter.prototype.download = function () {
    var tempLink = document.createElement("a");
    tempLink.href = this.stage.toDataURL();
    tempLink.download = "plot.png";
    tempLink.click();
};

Plotter.prototype._drawBg = function () {
    // add transparent box to enhance dragging
    var ranges = this._ranges();

    var rect = this.plotsLayer.findOne("#bg");
    if (rect) {
        rect.x(ranges[0]);
        rect.y(ranges[2]);
        rect.width(ranges[1] - ranges[0]);
        rect.height(ranges[3] - ranges[2]);
    } else {
        rect = new Konva.Rect({
            id: "bg",
            x: ranges[0],
            y: ranges[2],
            width: ranges[1] - ranges[0],
            height: ranges[3] - ranges[2],
            fill: "#fff",
            stroke: '#fff',
            strokeWidth: 0,
            opacity: 0,
            perfectDrawEnabled: false,
            shadowForStrokeEnabled: false
        });

        this.plotsLayer.add(rect);
    }
};

Plotter.prototype._drawBorder = function () {
    // add border box to enhance dragging
    var rect = new Konva.Rect({
        id: "border",
        x: 0,
        y: 0,
        width: this.width,
        height: this.height,
        fill: '#fff',
        stroke: '#555',
        strokeWidth: 2,
        perfectDrawEnabled: false,
        listening: false,
        shadowForStrokeEnabled: false
    });

    this.staticLayer.add(rect);
};

Plotter.prototype.resetView = function () {

    this.plotsLayer.position({x: 0, y: 0});
    this.setWindow(this._initialRanges.minX, this._initialRanges.maxX, this._initialRanges.minY, this._initialRanges.maxY, true);

    this.refresh();
};

Plotter.prototype.zoom = function (zoom) {

    var scale = this.plotsLayer.scale();
    var offset = this.plotsLayer.offset();

    this.plotsLayer.scale({x: scale.x * zoom, y: scale.y * zoom});
    this.plotsLayer.offset({x: offset.x / zoom, y: offset.y / zoom});

    this.refresh();
};

Plotter.prototype._minRatio = function (rangeX, rangeY, width, height) {

    var xRatio = width / rangeX;
    var yRatio = height / rangeY;

    return yRatio < xRatio ? yRatio : xRatio;
};

Plotter.prototype._filledRanges = function (minX, maxX, minY, maxY, width, height) {

    var rangeX = maxX - minX;
    var rangeY = maxY - minY;

    var differ, ratio = this._minRatio(rangeX, rangeY, width, height);

    if (rangeX * ratio < width) {
        differ = (width / ratio - rangeX) / 2;
        return [minX - differ, maxX + differ, minY, maxY];
    }

    if (rangeY * ratio < height) {
        differ = (height / ratio - rangeY) / 2;
        return [minX, maxX, minY - differ, maxY + differ];
    }

    return [minX, maxX, minY, maxY];
};

Plotter.prototype._ranges = function () {

    var positionX = this.plotsLayer.position().x / this.plotsLayer.scaleX();
    var positionY = this.plotsLayer.position().y / this.plotsLayer.scaleY();

    var minX = this.plotsLayer.offsetX() - positionX,
        maxX = this.width / this.plotsLayer.scaleX() + this.plotsLayer.offsetX() - positionX,
        minY = this.height / this.plotsLayer.scaleY() + this.plotsLayer.offsetY() - positionY,
        maxY = this.plotsLayer.offsetY() - positionY;

    return [minX, maxX, minY, maxY];
};

Plotter.prototype._scaleSize = function (size) {
    var scale = (Math.abs(this.plotsLayer.scaleX()) + Math.abs(this.plotsLayer.scaleY())) / 2;
    return size / scale;
};

Plotter.prototype._transformMatrix = function (minX, maxX, minY, maxY, width, height) {
    var ratio = this._minRatio(maxX - minX, maxY - minY, width, height);

    var xIntercept = -(minX * ratio);
    var yIntercept = maxY * ratio;

    return [ratio, 0, 0, -ratio, xIntercept, yIntercept];
};