(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "expr-eval", "Konva"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("expr-eval"), require("Konva"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.exprEval, global.Konva);
    global.plotter = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _exprEval, _Konva) {
  'use strict';

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _Konva = _interopRequireDefault(_Konva);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  var _default = window.Plotter =
  /*#__PURE__*/
  function () {
    _createClass(Plotter, null, [{
      key: "Version",
      get: function get() {
        return '1.2.0';
      }
      /**
       * @param {string} canvasId - pass the canvas id
       * @param {number} width - with of the canvas
       * @param {number} height - height of the canvas
       * @param {{minX: number, maxX: number, minY: number, maxY: number}} ranges - initial range of the window
       * @param {object} config
       */

    }]);

    function Plotter(canvasId) {
      var width = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : window.width - 200;
      var height = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : window.height - 200;
      var ranges = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
        minX: -5,
        maxX: 5,
        minY: -5,
        maxY: 5
      };

      var _ref = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {},
          _ref$gridColor = _ref.gridColor,
          gridColor = _ref$gridColor === void 0 ? '#888' : _ref$gridColor,
          _ref$bgColor = _ref.bgColor,
          bgColor = _ref$bgColor === void 0 ? '#fff' : _ref$bgColor,
          _ref$borderColor = _ref.borderColor,
          borderColor = _ref$borderColor === void 0 ? '#333' : _ref$borderColor,
          _ref$borderWidth = _ref.borderWidth,
          borderWidth = _ref$borderWidth === void 0 ? 2 : _ref$borderWidth,
          _ref$textFontSize = _ref.textFontSize,
          textFontSize = _ref$textFontSize === void 0 ? 14 : _ref$textFontSize,
          _ref$textFontStyle = _ref.textFontStyle,
          textFontStyle = _ref$textFontStyle === void 0 ? 'bold' : _ref$textFontStyle,
          _ref$axesWidth = _ref.axesWidth,
          axesWidth = _ref$axesWidth === void 0 ? 1 : _ref$axesWidth;

      _classCallCheck(this, Plotter);

      /**
       * Array of plots
       *
       * @type {Array}
       */
      this.plots = [];
      this.gridColor = gridColor;
      this.bgColor = bgColor;
      this.borderColor = borderColor;
      this.borderWidth = borderWidth;
      this.textFontSize = textFontSize;
      this.textFontStyle = textFontStyle;
      this.axesWidth = axesWidth;
      this.width = width;
      this.height = height;
      this.stage = new _Konva.default.Stage({
        container: canvasId,
        width: width,
        height: height
      });
      this.staticLayer = new _Konva.default.Layer({
        hitGraphEnabled: false
      });
      this.stage.add(this.staticLayer);
      this.plotsLayer = new _Konva.default.Layer({
        draggable: true
      });
      this.stage.add(this.plotsLayer);
      /**
       * Store initial ranges for reset view
       *
       * @type {Object}
       * @private
       */

      this._initialRanges = ranges;
      this.setWindow(ranges.minX, ranges.maxX, ranges.minY, ranges.maxY, true);

      this._drawBg();

      this._drawBorder();

      this.drawAxes();
      this.plotsLayer.draw();
      this.staticLayer.draw();
      var self = this; // drag

      this.stage.on('dragend', function (e) {
        self.refresh();
      });
    }
    /**
     * Return the container
     *
     * @returns {HTMLElement}
     */


    _createClass(Plotter, [{
      key: "setWindow",

      /**
       * set the window range
       *
       * @param {number} minX
       * @param {number} maxX
       * @param {number} minY
       * @param {number} maxY
       * @param {boolean} fill - fill the window based on the canvas size
       */
      value: function setWindow(minX, maxX, minY, maxY) {
        var fill = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;

        if (fill) {
          var filledRanges = Plotter.calcFilledRanges(minX, maxX, minY, maxY, this.width, this.height);
          minX = filledRanges.minX;
          maxX = filledRanges.maxX;
          minY = filledRanges.minY;
          maxY = filledRanges.maxY;
        }

        var transformMatrix = Plotter.calcTransformMatrix(minX, maxX, minY, maxY, this.width, this.height); // transform the plots layer

        this.plotsLayer.scaleX(transformMatrix[0]);
        this.plotsLayer.scaleY(transformMatrix[3]);
        this.plotsLayer.offsetX(-transformMatrix[4] / transformMatrix[0]);
        this.plotsLayer.offsetY(-transformMatrix[5] / transformMatrix[3]);
      }
      /**
       * Redraw the canvas
       */

    }, {
      key: "refresh",
      value: function refresh() {
        this._drawBg();

        this.drawAxes();

        this._redraw();

        this.plotsLayer.draw();
      }
      /**
       * Draw axes
       */

    }, {
      key: "drawAxes",
      value: function drawAxes() {
        var ranges = this._calcRanges();

        var minX = ranges.minX,
            maxX = ranges.maxX,
            minY = ranges.minY,
            maxY = ranges.maxY,
            rangeX = ranges.rangeX,
            rangeY = ranges.rangeY; // increase ranges for fluent view on drag

        minX -= rangeX;
        maxX += rangeX;
        minY -= rangeY;
        maxY += rangeY;

        function drawLine(layer, id, points, color, strokeSize, name) {
          var axis = layer.findOne('#' + id);

          if (axis) {
            axis.points(points);
            axis.strokeWidth(strokeSize);
          } else {
            axis = new _Konva.default.Line({
              points: points,
              stroke: color,
              strokeWidth: strokeSize,
              id: id,
              name: name,
              listening: false,
              transformsEnabled: 'none',
              strokeHitEnabled: false
            });
            layer.add(axis);
          }
        }

        var strokeSize = this._scaleSize(this.axesWidth);

        drawLine(this.plotsLayer, 'xAxis', [minX, 0, maxX, 0], this.gridColor, strokeSize);
        drawLine(this.plotsLayer, 'yAxis', [0, minY, 0, maxY], this.gridColor, strokeSize);

        function roundNumberOfDigits(number, decimal) {
          var roundLimitX = Math.pow(10, decimal);
          return Math.round(number / roundLimitX) * roundLimitX;
        }

        var counterLines = this.plotsLayer.find('.AxisCounter');
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

        if (stepX === 0) {
          stepX = 1;
        }

        var stepY = rangeY / (this.height / 60);
        var numberOfDigitsY = Math.floor(Math.log10(stepX));
        stepY = roundNumberOfDigits(stepY, numberOfDigitsY);

        if (stepY === 0) {
          stepY = 1;
        }

        var fixNumber = numberOfDigitsX < 0 ? -numberOfDigitsX : 0;
        var i, numberText; // Draw counter lines on horizontal axis

        for (i = stepX; i <= maxX; i += stepX) {
          numberText = i.toFixed(fixNumber);
          drawLine(this.plotsLayer, 'xAxis[' + numberText + ']', [i, -counterLineSize, i, counterLineSize], this.gridColor, strokeSize, 'AxisCounter');
          Plotter.writeMessage(this.plotsLayer, 'xAxisNum[' + numberText + ']', i - numberText.length * textHalfWidth, minusDoubleCounterLineSize, numberText, this.gridColor, fontSize, 'normal', 'AxisCounter');
        } // Draw counter lines on horizontal axis


        for (i = -stepX; i >= minX; i -= stepX) {
          numberText = i.toFixed(fixNumber);
          drawLine(this.plotsLayer, 'xAxis[' + numberText + ']', [i, -counterLineSize, i, counterLineSize], this.gridColor, strokeSize, 'AxisCounter');
          Plotter.writeMessage(this.plotsLayer, 'xAxisNum[' + numberText + ']', i - numberText.length * textHalfWidth, minusDoubleCounterLineSize, numberText, this.gridColor, fontSize, 'normal', 'AxisCounter');
        } // Draw little lines on vertical axis


        for (i = stepY; i <= maxY; i += stepY) {
          numberText = i.toFixed(fixNumber);
          drawLine(this.plotsLayer, 'yAxis[' + numberText + ']', [-counterLineSize, i, counterLineSize, i], this.gridColor, strokeSize, 'AxisCounter');
          Plotter.writeMessage(this.plotsLayer, 'yAxisNum[' + numberText + ']', minusDoubleCounterLineSize - numberText.length * textHalfWidth * 2, i + textHalfWidth, numberText, this.gridColor, fontSize, 'normal', 'AxisCounter');
        } // Draw little lines on vertical axis


        for (i = -stepY; i >= minY; i -= stepY) {
          numberText = i.toFixed(fixNumber);
          drawLine(this.plotsLayer, 'yAxis[' + numberText + ']', [-counterLineSize, i, counterLineSize, i], this.gridColor, strokeSize, 'AxisCounter');
          Plotter.writeMessage(this.plotsLayer, 'yAxisNum[' + numberText + ']', minusDoubleCounterLineSize - numberText.length * textHalfWidth * 2, i + textHalfWidth, numberText, this.gridColor, fontSize, 'normal', 'AxisCounter');
        }
      }
      /**
       * Write a message on a layer
       *
       * @param layer
       * @param id
       * @param x
       * @param y
       * @param message
       * @param color
       * @param fontSize
       * @param fontStyle
       * @param name
       */

    }, {
      key: "plot",

      /**
       * Add a new function and plot it
       *
       * @param func
       * @param color
       */
      value: function plot(func, color) {
        var expr = _exprEval.Parser.parse(func);

        var points = this._calcPoints(expr);

        var plot = new _Konva.default.Line({
          id: 'plot' + this.plots.length,
          points: points,
          stroke: color,
          strokeWidth: this._scaleSize(2),
          draggable: false,
          transformsEnabled: 'none',
          listening: false
        });
        this.plotsLayer.add(plot);
        this.plotsLayer.draw();

        this._addExpression(this.plots.length, func, color); // keep the original input and color assigned to the expression


        expr.expression = func;
        expr.color = color;
        this.plots.push(expr);
      }
      /**
       * Redraw the added functions
       *
       * @private
       */

    }, {
      key: "_redraw",
      value: function _redraw() {
        var strokeSize = this._scaleSize(2);

        for (var i = 0; i < this.plots.length; i++) {
          var plot = this.plotsLayer.findOne('#plot' + i);
          var expr = this.plots[i];

          var points = this._calcPoints(expr);

          plot.points(points);
          plot.strokeWidth(strokeSize);
        }
      }
      /**
       * Calculate points associated to a function in the defined range
       *
       * @param expr
       * @returns {Array}
       * @private
       */

    }, {
      key: "_calcPoints",
      value: function _calcPoints(expr) {
        var ranges = this._calcRanges();

        var minX = ranges.minX;
        var maxX = ranges.maxX;
        var minY = ranges.minY;
        var maxY = ranges.maxY;
        var rangeX = maxX - minX;
        var rangeY = maxY - minY;

        var stepFine = this._scaleSize(0.05);

        var stepRough = this._scaleSize(1);

        var points = [];
        var limitMinY = minY - rangeY;
        var limitMaxY = maxY + rangeY;
        var limitMaxX = maxX + rangeX;
        var x, y;

        for (x = minX - rangeX; x < minX; x += stepRough) {
          y = expr.evaluate({
            x: x
          });
          if (limitMaxY < y || y < limitMinY) continue;
          points.push(x);
          points.push(y);
        }

        for (x = minX; x < maxX; x += stepFine) {
          y = expr.evaluate({
            x: x
          });
          if (limitMaxY < y || y < limitMinY) continue;
          points.push(x);
          points.push(y);
        }

        for (x = maxX; x <= limitMaxX; x += stepRough) {
          y = expr.evaluate({
            x: x
          });
          if (limitMaxY < y || y < limitMinY) continue;
          points.push(x);
          points.push(y);
        }

        return points;
      }
    }, {
      key: "_addExpression",
      value: function _addExpression(plotNumber, func, color) {
        Plotter.writeMessage(this.staticLayer, 'expression' + this.plots.length, 10, 20 * this.plots.length + 10, func, color, 14, 'bold', 'expression');
        this.staticLayer.draw();
      }
    }, {
      key: "clear",
      value: function clear() {
        for (var i = 0; i < this.plots.length; i++) {
          var plot = this.plotsLayer.findOne('#plot' + i);
          plot.destroy();
          var expression = this.staticLayer.findOne('#expression' + i);
          expression.destroy();
        }

        this.plots = [];
        this.refresh();
        this.staticLayer.draw();
      }
    }, {
      key: "download",
      value: function download() {
        var tempLink = document.createElement('a');
        tempLink.href = this.stage.toDataURL();
        tempLink.download = 'plot.png';
        tempLink.click();
      }
      /**
       * Add a transparent box to enhance dragging
       *
       * @private
       */

    }, {
      key: "_drawBg",
      value: function _drawBg() {
        var ranges = this._calcRanges();

        var rangeX = ranges.maxX - ranges.minX;
        var rangeY = ranges.maxY - ranges.minY;
        var rect = this.plotsLayer.findOne('#bg');

        if (rect) {
          rect.x(ranges.minX);
          rect.y(ranges.minY);
          rect.width(rangeX);
          rect.height(rangeY);
        } else {
          rect = new _Konva.default.Rect({
            id: 'bg',
            x: ranges.minX,
            y: ranges.minY,
            width: rangeX,
            height: rangeY,
            fill: '#fff',
            // not important since the box is invisible
            stroke: '#fff',
            // not important since the box is invisible
            strokeWidth: 0,
            opacity: 0,
            perfectDrawEnabled: false,
            shadowForStrokeEnabled: false
          });
          this.plotsLayer.add(rect);
        }
      }
      /**
       * Add a border box to enhance dragging and add a border to canvas
       *
       * @private
       */

    }, {
      key: "_drawBorder",
      value: function _drawBorder() {
        var rect = new _Konva.default.Rect({
          id: 'border',
          x: 0,
          y: 0,
          width: this.width,
          height: this.height,
          fill: this.bgColor,
          stroke: this.borderColor,
          strokeWidth: this.borderWidth,
          perfectDrawEnabled: false,
          listening: false,
          shadowForStrokeEnabled: false
        });
        this.staticLayer.add(rect);
      }
      /**
       * Reset view to initial state
       */

    }, {
      key: "resetView",
      value: function resetView() {
        this.plotsLayer.position({
          x: 0,
          y: 0
        });
        this.setWindow(this._initialRanges.minX, this._initialRanges.maxX, this._initialRanges.minY, this._initialRanges.maxY, true);
        this.refresh();
      }
      /**
       * Zoom
       *
       * @param {number} zoom
       */

    }, {
      key: "zoom",
      value: function zoom(_zoom) {
        var scale = this.plotsLayer.scale();
        var offset = this.plotsLayer.offset();
        this.plotsLayer.scale({
          x: scale.x * _zoom,
          y: scale.y * _zoom
        });
        this.plotsLayer.offset({
          x: offset.x / _zoom,
          y: offset.y / _zoom
        });
        this.refresh();
      }
      /**
       * Calculate the smaller ratio
       *
       * @param {number} rangeX
       * @param {number} rangeY
       * @param {number} width
       * @param {number} height
       * @returns {number}
       *
       * @private
       */

    }, {
      key: "_calcRanges",

      /**
       * Calculate the displaying range
       *
       * @returns {{minX: number, maxX: number, minY: number, maxY: number, rangeX: number, rangeY: number}}
       * @private
       */
      value: function _calcRanges() {
        var positionX = this.plotsLayer.position().x / this.plotsLayer.scaleX();
        var positionY = this.plotsLayer.position().y / this.plotsLayer.scaleY();
        var minX = this.plotsLayer.offsetX() - positionX;
        var maxX = this.width / this.plotsLayer.scaleX() + this.plotsLayer.offsetX() - positionX;
        var minY = this.height / this.plotsLayer.scaleY() + this.plotsLayer.offsetY() - positionY;
        var maxY = this.plotsLayer.offsetY() - positionY;
        return {
          minX: minX,
          maxX: maxX,
          minY: minY,
          maxY: maxY,
          rangeX: maxX - minX,
          rangeY: maxY - minY
        };
      }
      /**
       * Calculate scale to zoom in and zoom out
       *
       * @param {number} size
       * @returns {number}
       * @private
       */

    }, {
      key: "_scaleSize",
      value: function _scaleSize(size) {
        var scale = (Math.abs(this.plotsLayer.scaleX()) + Math.abs(this.plotsLayer.scaleY())) / 2;
        return size / scale;
      }
      /**
       * Calculate the transformation matrix
       *
       * @param {number} minX
       * @param {number} maxX
       * @param {number} minY
       * @param {number} maxY
       * @param {number} width
       * @param {number} height
       * @returns {*[]}
       * @private
       */

    }, {
      key: "getContainer",
      get: function get() {
        return this.stage.container();
      }
    }], [{
      key: "writeMessage",
      value: function writeMessage(layer, id, x, y, message, color) {
        var fontSize = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 14;
        var fontStyle = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : 'normal';
        var name = arguments.length > 8 ? arguments[8] : undefined;
        var text = layer.findOne('#' + id);

        if (text) {
          text.x(x);
          text.y(y);
          text.text(message);
          text.fontSize(fontSize);
          text.fill(color);
        } else {
          text = new _Konva.default.Text({
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
      }
    }, {
      key: "calcMinRatio",
      value: function calcMinRatio(rangeX, rangeY, width, height) {
        var xRatio = width / rangeX;
        var yRatio = height / rangeY;
        return yRatio < xRatio ? yRatio : xRatio;
      }
      /**
       * calculate the range to fill the canvas
       *
       * @param {number} minX
       * @param {number} maxX
       * @param {number} minY
       * @param {number} maxY
       * @param {number} width
       * @param {number} height
       * @returns {{minX: number, maxX: number, minY: number, maxY: number, rangeX: number, rangeY: number}}
       *
       * @private
       */

    }, {
      key: "calcFilledRanges",
      value: function calcFilledRanges(minX, maxX, minY, maxY, width, height) {
        var rangeX = maxX - minX;
        var rangeY = maxY - minY;
        var differ;
        var ratio = Plotter.calcMinRatio(rangeX, rangeY, width, height); // increase horizontal range to fill the canvas

        if (rangeX * ratio < width) {
          differ = (width / ratio - rangeX) / 2;
          return {
            minX: minX - differ,
            maxX: maxX + differ,
            minY: minY,
            maxY: maxY,
            rangeX: maxX + differ - (minX - differ),
            rangeY: maxY - minY
          };
        } // increase vertical range to fill the canvas


        if (rangeY * ratio < height) {
          differ = (height / ratio - rangeY) / 2;
          return {
            minX: minX,
            maxX: maxX,
            minY: minY - differ,
            maxY: maxY + differ,
            rangeX: maxX - minX,
            rangeY: maxY + differ - (minY - differ)
          };
        }

        return {
          minX: minX,
          maxX: maxX,
          minY: minY,
          maxY: maxY,
          rangeX: maxX - minX,
          rangeY: maxY - minY
        };
      }
    }, {
      key: "calcTransformMatrix",
      value: function calcTransformMatrix(minX, maxX, minY, maxY, width, height) {
        var ratio = Plotter.calcMinRatio(maxX - minX, maxY - minY, width, height);
        var xIntercept = -(minX * ratio);
        var yIntercept = maxY * ratio;
        return [ratio, 0, 0, -ratio, xIntercept, yIntercept];
      }
    }]);

    return Plotter;
  }();

  _exports.default = _default;
});
//# sourceMappingURL=plotter.js.map
