<script src="https://code.jquery.com/jquery-3.4.1.min.js" integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=" crossorigin="anonymous"></script>

<script src="https://cdn.jsdelivr.net/npm/expr-eval@2.0.2/dist/bundle.min.js"></script>
<script src="https://unpkg.com/konva@4.0.0/konva.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/Erfans/Plotter/dist/plotter.min.js"></script>

<div class="my-3 justify-content-center">
    <form name="plotter" method="post" class="form-inline">
        <label class="mr-2 mt-2 required" for="plotter_function">f(x):</label>
        <input type="text" id="plotter_function" name="plotter_function"
               required="required" class="mr-2 mt-2 form-control" value="sin x"/>

        <label class="sr-only mr-2 mt-2 required" for="plotter_color">color</label>
        <select id="plotter_color" name="plotter_color" class="form-control">
            <option value="#C0C0C0">Silver</option>
            <option value="#464646">Charcoal</option>
            <option value="#084C9E">Royal Blue</option>
            <option value="#00FFFF">Cyan</option>
            <option value="#008080">Teal</option>
            <option value="#808000">Olive</option>
            <option value="#BFFF00">Lime</option>
            <option value="#FFD700">Golden</option>
            <option value="#FA8072">Salmon</option>
            <option value="#B57EDC" selected="selected">Lavender</option>
            <option value="#843179">Plum</option>
            <option value="#800000">Maroon</option>
            <option value="#DC143C">Crimson</option>
        </select>

        <button id="plotter_draw" type="button" class="btn btn-primary mx-2 mt-2">draw</button>
        <button id="plotter_clear" type="button" class="btn btn-danger mr-2 mt-2">clear</button>
        <button id="plotter_download" type="button" class="btn btn-success mr-2 mt-2">download</button>
        <button id="plotter_reset" type="button" class="btn btn-secondary mr-2 mt-2">reset view</button>
    </form>
</div>

<div id="canvas-container"></div>

<div class="card mt-5">
    <div class="card-header">
        <h5 class="card-title">examples</h5>
    </div>
    <ul class="list-group list-group-flush">
        <li class="list-group-item">
            <a onclick="plot('roundTo(sin x, 0)')" href="javascript:void(0);">roundTo(sin x, 0)</a>
        </li>
        <li class="list-group-item">
            <a onclick="plot('abs(max(sin x, cos x))')" href="javascript:void(0);">abs(max(sin x, cos x))</a>
        </li>
        <li class="list-group-item">
            <a onclick="plot('x * sin x')" href="javascript:void(0);">x * sin x</a>
        </li>
        <li class="list-group-item">
            <a onclick="plot('1 / log abs x')" href="javascript:void(0);">1 / log abs x</a>
        </li>
        <li class="list-group-item">
            <a onclick="plot('1')" href="javascript:void(0);">1</a>
        </li>
        <li class="list-group-item">
            <a onclick="plot('sqrt abs sin x')" href="javascript:void(0);">sqrt abs sin x</a>
        </li>
    </ul>
</div>

<div class="card mt-5">
    <div class="card-header">
        <h5 class="card-title">references</h5>
    </div>
    <ul class="list-group list-group-flush">
        <li class="list-group-item">
            <a href="https://github.com/Erfans/Plotter" target="_blank">Plotter</a>
        </li>
        <li class="list-group-item">
            <a href="https://github.com/silentmatt/expr-eval" target="_blank">
                JavaScript Expression Evaluator</a>
        </li>
        <li class="list-group-item">
            <a href="http://konvajs.github.io/" target="_blank">Konva.js</a>
            (HTML5 2d canvas library for desktop and mobile applications.)
        </li>
    </ul>
</div>

<table class="table table-striped table-bordered mt-3 caption-top first-column-no-wrap first-column-bold">
    <caption>
        possible operations <br/>
        references: <a href="https://github.com/silentmatt/expr-eval">https://github.com/silentmatt/expr-eval</a>
    </caption>
    <thead>
    <tr>
        <th>operator</th>
        <th>description</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td align="left">-x</td>
        <td align="left">Negation</td>
    </tr>
    <tr>
        <td align="left">+x</td>
        <td align="left">Unary plus. This converts it's operand to a number, but has no other effect.</td>
    </tr>
    <tr>
        <td align="left">x!</td>
        <td align="left">Factorial (x * (x-1) * (x-2) * … * 2 * 1). gamma(x + 1) for non-integers.</td>
    </tr>
    <tr>
        <td align="left">abs x</td>
        <td align="left">Absolute value (magnatude) of x</td>
    </tr>
    <tr>
        <td align="left">acos x</td>
        <td align="left">Arc cosine of x (in radians)</td>
    </tr>
    <tr>
        <td align="left">acosh x</td>
        <td align="left">Hyperbolic arc cosine of x (in radians)</td>
    </tr>
    <tr>
        <td align="left">asin x</td>
        <td align="left">Arc sine of x (in radians)</td>
    </tr>
    <tr>
        <td align="left">asinh x</td>
        <td align="left">Hyperbolic arc sine of x (in radians)</td>
    </tr>
    <tr>
        <td align="left">atan x</td>
        <td align="left">Arc tangent of x (in radians)</td>
    </tr>
    <tr>
        <td align="left">atanh x</td>
        <td align="left">Hyperbolic arc tangent of x (in radians)</td>
    </tr>
    <tr>
        <td align="left">ceil x</td>
        <td align="left">Ceiling of x — the smallest integer that’s &gt;= x</td>
    </tr>
    <tr>
        <td align="left">cos x</td>
        <td align="left">Cosine of x (x is in radians)</td>
    </tr>
    <tr>
        <td align="left">cosh x</td>
        <td align="left">Hyperbolic cosine of x (x is in radians)</td>
    </tr>
    <tr>
        <td align="left">exp x</td>
        <td align="left">e^x (exponential/antilogarithm function with base e)</td>
    </tr>
    <tr>
        <td align="left">floor x</td>
        <td align="left">Floor of x — the largest integer that’s &lt;= x</td>
    </tr>
    <tr>
        <td align="left">length x</td>
        <td align="left">String length of x</td>
    </tr>
    <tr>
        <td align="left">ln x</td>
        <td align="left">Natural logarithm of x</td>
    </tr>
    <tr>
        <td align="left">log x</td>
        <td align="left">Natural logarithm of x (synonym for ln, not base-10)</td>
    </tr>
    <tr>
        <td align="left">log10 x</td>
        <td align="left">Base-10 logarithm of x</td>
    </tr>
    <tr>
        <td align="left">not x</td>
        <td align="left">Logical NOT operator</td>
    </tr>
    <tr>
        <td align="left">round x</td>
        <td align="left">X, rounded to the nearest integer, using "gradeschool rounding"</td>
    </tr>
    <tr>
        <td align="left">sin x</td>
        <td align="left">Sine of x (x is in radians)</td>
    </tr>
    <tr>
        <td align="left">sinh x</td>
        <td align="left">Hyperbolic sine of x (x is in radians)</td>
    </tr>
    <tr>
        <td align="left">sqrt x</td>
        <td align="left">Square root of x. Result is NaN (Not a Number) if x is negative.</td>
    </tr>
    <tr>
        <td align="left">tan x</td>
        <td align="left">Tangent of x (x is in radians)</td>
    </tr>
    <tr>
        <td align="left">tanh x</td>
        <td align="left">Hyperbolic tangent of x (x is in radians)</td>
    </tr>
    <tr>
        <td align="left">trunc x</td>
        <td align="left">Integral part of a X, looks like floor(x) unless for negative number</td>
    </tr>
    <tr>
        <td align="left">random(n)</td>
        <td align="left">Get a random number in the range [0, n). If n is zero, or not provided, it defaults to 1.
        </td>
    </tr>
    <tr>
        <td align="left">fac(n)</td>
        <td align="left">n! (factorial of n: "n * (n-1) * (n-2) * … * 2 * 1") Deprecated. Use the ! operator
            instead.
        </td>
    </tr>
    <tr>
        <td align="left">min(a,b,…)</td>
        <td align="left">Get the smallest (minimum) number in the list</td>
    </tr>
    <tr>
        <td align="left">max(a,b,…)</td>
        <td align="left">Get the largest (maximum) number in the list</td>
    </tr>
    <tr>
        <td align="left">hypot(a,b)</td>
        <td align="left">Hypotenuse, i.e. the square root of the sum of squares of its arguments.</td>
    </tr>
    <tr>
        <td align="left">pyt(a, b)</td>
        <td align="left">Alias for hypot</td>
    </tr>
    <tr>
        <td align="left">pow(x, y)</td>
        <td align="left">Equivalent to x^y. For consistency with JavaScript's Math object.</td>
    </tr>
    <tr>
        <td align="left">atan2(y, x)</td>
        <td align="left">Arc tangent of x/y. i.e. the angle between (0, 0) and (x, y) in radians.</td>
    </tr>
    <tr>
        <td align="left">if(c, a, b)</td>
        <td align="left">Function form of c ? a : b</td>
    </tr>
    <tr>
        <td align="left">roundTo(x, n)</td>
        <td align="left">Rounds x to n places after the decimal point.</td>
    </tr>
    </tbody>
</table>

<script>

  const defaultColor = '888888'
  let plotter

  // convert hash to js object
  function deserializeHash (hash) {

    hash = hash || location.hash

    var parts = hash.split('/')
    var obj = {}

    for (var i = 1; i < parts.length; i++) {
      var part = parts[i]
      var subParts = part.split('=')

      obj[decodeURI(subParts[0])] = subParts[1] || defaultColor
    }

    return obj
  }

  // convert js object to hash
  function serializeHash (obj) {

    var hash = '#!'

    for (var exp in obj) {
      var expression = encodeURI(exp)
      var color = obj[exp]

      hash += '/' + expression + (color ? '=' + color : '')
    }

    return hash
  }

  // update url to make applications transferable through url
  function updateUrl (plotter) {
    var exprs = plotter.plots
    var params = {}

    for (var i = 0; i < exprs.length; i++) {
      var expr = exprs[i]
      params[expr.expression] = expr.color.replace(/^#/, '')
    }

    window.location.hash = serializeHash(params)
  }

  // plot function
  function plot (expression, color) {

    if (expression === undefined) {
      var $function = $('#plotter_function')
      // expression
      expression = $function.val()
      // clear function field
      $function.val('')
      // get focus to enter the next expression
      $function.focus()
    }

    // color
    color = color || $('#plotter_color').val()

    // plot
    plotter.plot(expression, color)

    // update url
    updateUrl(plotter)
  }

  document.addEventListener('DOMContentLoaded', function () {

    var width = $('#canvas-container').width()
    var height = window.innerHeight - 200

    // initial the plotter
    plotter = new Plotter('canvas-container', width, height, {minX: -5, maxX: 5, minY: -5, maxY: 5})

    // zoom
    $(plotter.getContainer).on('mousewheel DOMMouseScroll', function (e) {

      // preventing the page scroll
      e.preventDefault()

      var delta = navigator.userAgent.toLowerCase().indexOf('firefox') > -1 ?
        e.originalEvent.detail > 0 ? 1 / 1.2 : 1.2 :
        e.originalEvent.wheelDelta < 0 ? 1 / 1.2 : 1.2

      plotter.zoom(delta)
    })

    // draw plot on pressing draw button
    $('#plotter_draw').click(function (e) {
      plot()
    })

    // draw plot on pressing enter in function field
    $('#plotter_function').on('keypress', function (e) {
      if (e.keyCode === 13) {
        plot()
        return false
      }
    })

    // clear plots
    $('#plotter_clear').click(function (e) {
      plotter.clear()

      // update url
      updateUrl(plotter)
    })

    // download plots
    $('#plotter_download').click(function (e) {
      plotter.download()
    })

    // reset view
    $('#plotter_reset').click(function (e) {
      plotter.resetView()
    })

    // plot passed functions through url hash
    var exprObj = deserializeHash()
    for (var f in exprObj) {
      plotter.plot(f, '#' + exprObj[f])
    }

  })
</script>
