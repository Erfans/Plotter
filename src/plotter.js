'use strict'

import {Parser} from 'expr-eval'
import Konva from 'konva'

class Plotter {
  static get Version () {
    return '1.1.0'
  }

  /**
   * @param {string} canvasId - pass the canvas id
   * @param {number} width - with of the canvas
   * @param {number} height - height of the canvas
   * @param {{minX: number, maxX: number, minY: number, maxY: number}} ranges - initial range of the window
   * @param {object} config
   */
  constructor (
    canvasId,
    width = window.width - 200,
    height = window.height - 200,
    ranges = {minX: -5, maxX: 5, minY: -5, maxY: 5},
    {
      gridColor = '#888',
      bgColor = '#fff',
      borderColor = '#333',
      borderWidth = 2,
      textFontSize = 14,
      textFontStyle = 'bold',
      axesWidth = 1
    } = {}) {
    /**
     * Array of plots
     *
     * @type {Array}
     */
    this.plots = []

    this.gridColor = gridColor
    this.bgColor = bgColor
    this.borderColor = borderColor
    this.borderWidth = borderWidth
    this.textFontSize = textFontSize
    this.textFontStyle = textFontStyle
    this.axesWidth = axesWidth

    this.width = width
    this.height = height

    this.stage = new Konva.Stage({
      container: canvasId,
      width: width,
      height: height
    })

    this.staticLayer = new Konva.Layer({hitGraphEnabled: false})
    this.stage.add(this.staticLayer)

    this.plotsLayer = new Konva.Layer({draggable: true})
    this.stage.add(this.plotsLayer)

    /**
     * Store initial ranges for reset view
     *
     * @type {Object}
     * @private
     */
    this._initialRanges = ranges

    this.setWindow(ranges.minX, ranges.maxX, ranges.minY, ranges.maxY, true)
    this._drawBg()
    this._drawBorder()
    this.drawAxes()

    this.plotsLayer.draw()
    this.staticLayer.draw()

    let self = this

    // drag
    this.stage.on('dragend', function (e) {
      self.refresh()
    })
  }

  /**
   * Return the container
   *
   * @returns {HTMLElement}
   */
  get getContainer () {
    return this.stage.container()
  }

  /**
   * set the window range
   *
   * @param {number} minX
   * @param {number} maxX
   * @param {number} minY
   * @param {number} maxY
   * @param {boolean} fill - fill the window based on the canvas size
   */
  setWindow (minX, maxX, minY, maxY, fill = true) {
    if (fill) {
      let filledRanges = Plotter.calcFilledRanges(minX, maxX, minY, maxY, this.width, this.height)
      ;({minX, maxX, minY, maxY} = filledRanges)
    }

    let transformMatrix = Plotter.calcTransformMatrix(minX, maxX, minY, maxY, this.width, this.height)

    // transform the plots layer
    this.plotsLayer.scaleX(transformMatrix[0])
    this.plotsLayer.scaleY(transformMatrix[3])
    this.plotsLayer.offsetX(-transformMatrix[4] / transformMatrix[0])
    this.plotsLayer.offsetY(-transformMatrix[5] / transformMatrix[3])
  }

  /**
   * Redraw the canvas
   */
  refresh () {
    this._drawBg()
    this.drawAxes()
    this._redraw()

    this.plotsLayer.draw()
  }

  /**
   * Draw axes
   */
  drawAxes () {
    let ranges = this._calcRanges()
    let {minX, maxX, minY, maxY, rangeX, rangeY} = ranges

    // increase ranges for fluent view on drag
    minX -= rangeX
    maxX += rangeX
    minY -= rangeY
    maxY += rangeY

    function drawLine (layer, id, points, color, strokeSize, name) {
      let axis = layer.findOne('#' + id)
      if (axis) {
        axis.points(points)
        axis.strokeWidth(strokeSize)
      } else {
        axis = new Konva.Line({
          points: points,
          stroke: color,
          strokeWidth: strokeSize,
          id: id,
          name: name,
          listening: false,
          transformsEnabled: 'none',
          strokeHitEnabled: false
        })
        layer.add(axis)
      }
    }

    let strokeSize = this._scaleSize(this.axesWidth)

    drawLine(this.plotsLayer, 'xAxis', [minX, 0, maxX, 0], this.gridColor, strokeSize)
    drawLine(this.plotsLayer, 'yAxis', [0, minY, 0, maxY], this.gridColor, strokeSize)

    function roundNumberOfDigits (number, decimal) {
      let roundLimitX = Math.pow(10, decimal)
      return Math.round(number / roundLimitX) * roundLimitX
    }

    let counterLines = this.plotsLayer.find('.AxisCounter')
    counterLines.each(function (counterLine) {
      counterLine.destroy()
    })

    let counterLineSize = this._scaleSize(5)
    let fontSize = 12
    let textHalfWidth = this._scaleSize(3)
    let minusDoubleCounterLineSize = -counterLineSize * 2

    let stepX = rangeX / (this.width / 60)
    let numberOfDigitsX = Math.floor(Math.log10(stepX))
    stepX = roundNumberOfDigits(stepX, numberOfDigitsX)
    if (stepX === 0) {
      stepX = 1
    }

    let stepY = rangeY / (this.height / 60)
    let numberOfDigitsY = Math.floor(Math.log10(stepX))
    stepY = roundNumberOfDigits(stepY, numberOfDigitsY)
    if (stepY === 0) {
      stepY = 1
    }

    let fixNumber = numberOfDigitsX < 0 ? -numberOfDigitsX : 0
    let i, numberText
    // Draw counter lines on horizontal axis
    for (i = stepX; i <= maxX; i += stepX) {
      numberText = i.toFixed(fixNumber)
      drawLine(this.plotsLayer, 'xAxis[' + numberText + ']', [i, -counterLineSize, i, counterLineSize], this.gridColor, strokeSize, 'AxisCounter')
      Plotter.writeMessage(this.plotsLayer, 'xAxisNum[' + numberText + ']', i - numberText.length * textHalfWidth, minusDoubleCounterLineSize, numberText, this.gridColor, fontSize, 'normal', 'AxisCounter')
    }

    // Draw counter lines on horizontal axis
    for (i = -stepX; i >= minX; i -= stepX) {
      numberText = i.toFixed(fixNumber)
      drawLine(this.plotsLayer, 'xAxis[' + numberText + ']', [i, -counterLineSize, i, counterLineSize], this.gridColor, strokeSize, 'AxisCounter')
      Plotter.writeMessage(this.plotsLayer, 'xAxisNum[' + numberText + ']', i - numberText.length * textHalfWidth, minusDoubleCounterLineSize, numberText, this.gridColor, fontSize, 'normal', 'AxisCounter')
    }

    // Draw little lines on vertical axis
    for (i = stepY; i <= maxY; i += stepY) {
      numberText = i.toFixed(fixNumber)
      drawLine(this.plotsLayer, 'yAxis[' + numberText + ']', [-counterLineSize, i, counterLineSize, i], this.gridColor, strokeSize, 'AxisCounter')
      Plotter.writeMessage(this.plotsLayer, 'yAxisNum[' + numberText + ']', minusDoubleCounterLineSize - numberText.length * textHalfWidth * 2, i + textHalfWidth, numberText, this.gridColor, fontSize, 'normal', 'AxisCounter')
    }

    // Draw little lines on vertical axis
    for (i = -stepY; i >= minY; i -= stepY) {
      numberText = i.toFixed(fixNumber)
      drawLine(this.plotsLayer, 'yAxis[' + numberText + ']', [-counterLineSize, i, counterLineSize, i], this.gridColor, strokeSize, 'AxisCounter')
      Plotter.writeMessage(this.plotsLayer, 'yAxisNum[' + numberText + ']', minusDoubleCounterLineSize - numberText.length * textHalfWidth * 2, i + textHalfWidth, numberText, this.gridColor, fontSize, 'normal', 'AxisCounter')
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
  static writeMessage (layer, id, x, y, message, color, fontSize = 14, fontStyle = 'normal', name) {
    let text = layer.findOne('#' + id)
    if (text) {
      text.x(x)
      text.y(y)
      text.text(message)
      text.fontSize(fontSize)
      text.fill(color)
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
      })
      layer.add(text)
    }
  }

  /**
   * Add a new function and plot it
   *
   * @param func
   * @param color
   */
  plot (func, color) {
    let expr = Parser.parse(func)
    let points = this._calcPoints(expr)

    let plot = new Konva.Line({
      id: 'plot' + this.plots.length,
      points: points,
      stroke: color,
      strokeWidth: this._scaleSize(2),
      draggable: false,
      transformsEnabled: 'none',
      listening: false
    })

    this.plotsLayer.add(plot)
    this.plotsLayer.draw()

    this._addExpression(this.plots.length, func, color)

    // keep the original input and color assigned to the expression
    expr.expression = func
    expr.color = color

    this.plots.push(expr)
  }

  /**
   * Redraw the added functions
   *
   * @private
   */
  _redraw () {
    let strokeSize = this._scaleSize(2)

    for (let i = 0; i < this.plots.length; i++) {
      let plot = this.plotsLayer.findOne('#plot' + i)
      let expr = this.plots[i]
      let points = this._calcPoints(expr)
      plot.points(points)
      plot.strokeWidth(strokeSize)
    }
  }

  /**
   * Calculate points associated to a function in the defined range
   *
   * @param expr
   * @returns {Array}
   * @private
   */
  _calcPoints (expr) {
    let ranges = this._calcRanges()

    let minX = ranges.minX
    let maxX = ranges.maxX
    let minY = ranges.minY
    let maxY = ranges.maxY

    let rangeX = maxX - minX
    let rangeY = maxY - minY

    let stepFine = this._scaleSize(0.05)
    let stepRough = this._scaleSize(1)

    let points = []

    let limitMinY = minY - rangeY
    let limitMaxY = maxY + rangeY
    let limitMaxX = maxX + rangeX

    let x, y
    for (x = minX - rangeX; x < minX; x += stepRough) {
      y = expr.evaluate({x: x})
      if (limitMaxY < y || y < limitMinY) continue
      points.push(x)
      points.push(y)
    }

    for (x = minX; x < maxX; x += stepFine) {
      y = expr.evaluate({x: x})
      if (limitMaxY < y || y < limitMinY) continue
      points.push(x)
      points.push(y)
    }

    for (x = maxX; x <= limitMaxX; x += stepRough) {
      y = expr.evaluate({x: x})
      if (limitMaxY < y || y < limitMinY) continue
      points.push(x)
      points.push(y)
    }

    return points
  }

  _addExpression (plotNumber, func, color) {
    Plotter.writeMessage(this.staticLayer, 'expression' + this.plots.length, 10, 20 * this.plots.length + 10, func, color, 14, 'bold', 'expression')
    this.staticLayer.draw()
  }

  clear () {
    for (let i = 0; i < this.plots.length; i++) {
      let plot = this.plotsLayer.findOne('#plot' + i)
      plot.destroy()
      let expression = this.staticLayer.findOne('#expression' + i)
      expression.destroy()
    }
    this.plots = []

    this.refresh()
    this.staticLayer.draw()
  }

  download () {
    let tempLink = document.createElement('a')
    tempLink.href = this.stage.toDataURL()
    tempLink.download = 'plot.png'
    tempLink.click()
  }

  /**
   * Add a transparent box to enhance dragging
   *
   * @private
   */
  _drawBg () {
    let ranges = this._calcRanges()

    let rangeX = ranges.maxX - ranges.minX
    let rangeY = ranges.maxY - ranges.minY

    let rect = this.plotsLayer.findOne('#bg')
    if (rect) {
      rect.x(ranges.minX)
      rect.y(ranges.minY)
      rect.width(rangeX)
      rect.height(rangeY)
    } else {
      rect = new Konva.Rect({
        id: 'bg',
        x: ranges.minX,
        y: ranges.minY,
        width: rangeX,
        height: rangeY,
        fill: '#fff', // not important since the box is invisible
        stroke: '#fff', // not important since the box is invisible
        strokeWidth: 0,
        opacity: 0,
        perfectDrawEnabled: false,
        shadowForStrokeEnabled: false
      })

      this.plotsLayer.add(rect)
    }
  }

  /**
   * Add a border box to enhance dragging and add a border to canvas
   *
   * @private
   */
  _drawBorder () {
    let rect = new Konva.Rect({
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
    })

    this.staticLayer.add(rect)
  }

  /**
   * Reset view to initial state
   */
  resetView () {
    this.plotsLayer.position({x: 0, y: 0})
    this.setWindow(this._initialRanges.minX, this._initialRanges.maxX, this._initialRanges.minY, this._initialRanges.maxY, true)

    this.refresh()
  }

  /**
   * Zoom
   *
   * @param {number} zoom
   */
  zoom (zoom) {
    let scale = this.plotsLayer.scale()
    let offset = this.plotsLayer.offset()

    this.plotsLayer.scale({x: scale.x * zoom, y: scale.y * zoom})
    this.plotsLayer.offset({x: offset.x / zoom, y: offset.y / zoom})

    this.refresh()
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
  static calcMinRatio (rangeX, rangeY, width, height) {
    let xRatio = width / rangeX
    let yRatio = height / rangeY

    return yRatio < xRatio ? yRatio : xRatio
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
  static calcFilledRanges (minX, maxX, minY, maxY, width, height) {
    let rangeX = maxX - minX
    let rangeY = maxY - minY

    let differ
    let ratio = Plotter.calcMinRatio(rangeX, rangeY, width, height)

    // increase horizontal range to fill the canvas
    if (rangeX * ratio < width) {
      differ = (width / ratio - rangeX) / 2
      return {
        minX: minX - differ,
        maxX: maxX + differ,
        minY: minY,
        maxY: maxY,
        rangeX: maxX + differ - (minX - differ),
        rangeY: maxY - minY
      }
    }

    // increase vertical range to fill the canvas
    if (rangeY * ratio < height) {
      differ = (height / ratio - rangeY) / 2
      return {
        minX: minX,
        maxX: maxX,
        minY: minY - differ,
        maxY: maxY + differ,
        rangeX: maxX - minX,
        rangeY: maxY + differ - (minY - differ)
      }
    }

    return {
      minX: minX,
      maxX: maxX,
      minY: minY,
      maxY: maxY,
      rangeX: maxX - minX,
      rangeY: maxY - minY
    }
  }

  /**
   * Calculate the displaying range
   *
   * @returns {{minX: number, maxX: number, minY: number, maxY: number, rangeX: number, rangeY: number}}
   * @private
   */
  _calcRanges () {
    let positionX = this.plotsLayer.position().x / this.plotsLayer.scaleX()
    let positionY = this.plotsLayer.position().y / this.plotsLayer.scaleY()

    let minX = this.plotsLayer.offsetX() - positionX
    let maxX = this.width / this.plotsLayer.scaleX() + this.plotsLayer.offsetX() - positionX
    let minY = this.height / this.plotsLayer.scaleY() + this.plotsLayer.offsetY() - positionY
    let maxY = this.plotsLayer.offsetY() - positionY

    return {
      minX: minX,
      maxX: maxX,
      minY: minY,
      maxY: maxY,
      rangeX: maxX - minX,
      rangeY: maxY - minY
    }
  }

  /**
   * Calculate scale to zoom in and zoom out
   *
   * @param {number} size
   * @returns {number}
   * @private
   */
  _scaleSize (size) {
    let scale = (Math.abs(this.plotsLayer.scaleX()) + Math.abs(this.plotsLayer.scaleY())) / 2
    return size / scale
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
  static calcTransformMatrix (minX, maxX, minY, maxY, width, height) {
    let ratio = Plotter.calcMinRatio(maxX - minX, maxY - minY, width, height)

    let xIntercept = -(minX * ratio)
    let yIntercept = maxY * ratio

    return [ratio, 0, 0, -ratio, xIntercept, yIntercept]
  }
}

module.exports = Plotter
