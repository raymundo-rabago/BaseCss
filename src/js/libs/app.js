
// Avoid `console` errors in browsers that lack a console. =============================================================================================

(function() {
	
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
	
}());


// ====================================================================================================================================================


// GOOGLE FONTS
    WebFontConfig = {
      google: { families: [ 'Open+Sans:400,600,300:latin','Lato:400,300,700:latin,latin-ext' ] }
    };
    (function() {
      var wf = document.createElement('script');
      wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
        '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
      wf.type = 'text/javascript';
      wf.async = 'true';
      var s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(wf, s);
    })();
	
	
// ====================================================================================================================================================


/* InstantClick 3.1.0 | (C) 2014-2015 Alexandre Dieulot | http://instantclick.io/license */
var InstantClick = function(document, location) {
  // Internal variables
  var $ua = navigator.userAgent,
      $isChromeForIOS = $ua.indexOf(' CriOS/') > -1,
      $hasTouch = 'createTouch' in document,
      $currentLocationWithoutHash,
      $urlToPreload,
      $preloadTimer,
      $lastTouchTimestamp,

  // Preloading-related variables
      $history = {},
      $xhr,
      $url = false,
      $title = false,
      $mustRedirect = false,
      $body = false,
      $timing = {},
      $isPreloading = false,
      $isWaitingForCompletion = false,
      $trackedAssets = [],

  // Variables defined by public functions
      $useWhitelist,
      $preloadOnMousedown,
      $delayBeforePreload,
      $eventsCallbacks = {
        fetch: [],
        receive: [],
        wait: [],
        change: []
      }

  ////////// HELPERS //////////
  function removeHash(url) {
    var index = url.indexOf('#')
    if (index < 0) {
      return url
    }
    return url.substr(0, index)
  }

  function getLinkTarget(target) {
    while (target && target.nodeName != 'A') {
      target = target.parentNode
    }
    return target
  }

  function isBlacklisted(elem) {
    do {
      if (!elem.hasAttribute) { // Parent of <html>
        break
      }
      if (elem.hasAttribute('data-instant')) {
        return false
      }
      if (elem.hasAttribute('data-no-instant')) {
        return true
      }
    }
    while (elem = elem.parentNode);
    return false
  }

  function isWhitelisted(elem) {
    do {
      if (!elem.hasAttribute) { // Parent of <html>
        break
      }
      if (elem.hasAttribute('data-no-instant')) {
        return false
      }
      if (elem.hasAttribute('data-instant')) {
        return true
      }
    }
    while (elem = elem.parentNode);
    return false
  }

  function isPreloadable(a) {
    var domain = location.protocol + '//' + location.host

    if (a.target // target="_blank" etc.
        || a.hasAttribute('download')
        || a.href.indexOf(domain + '/') != 0 // Another domain, or no href attribute
        || (a.href.indexOf('#') > -1
            && removeHash(a.href) == $currentLocationWithoutHash) // Anchor
        || ($useWhitelist
            ? !isWhitelisted(a)
            : isBlacklisted(a))
       ) {
      return false
    }
    return true
  }

  function triggerPageEvent(eventType, arg1, arg2, arg3) {
    var returnValue = false
    for (var i = 0; i < $eventsCallbacks[eventType].length; i++) {
      if (eventType == 'receive') {
        var altered = $eventsCallbacks[eventType][i](arg1, arg2, arg3)
        if (altered) {
          /* Update args for the next iteration of the loop. */
          if ('body' in altered) {
            arg2 = altered.body
          }
          if ('title' in altered) {
            arg3 = altered.title
          }

          returnValue = altered
        }
      }
      else {
        $eventsCallbacks[eventType][i](arg1, arg2, arg3)
      }
    }
    return returnValue
  }

  function changePage(title, body, newUrl, scrollY) {
    document.documentElement.replaceChild(body, document.body)
    if (newUrl) {
      history.pushState(null, null, newUrl)

      var hashIndex = newUrl.indexOf('#'),
          hashElem = hashIndex > -1
                     && document.getElementById(newUrl.substr(hashIndex + 1)),
          offset = 0

      if (hashElem) {
        while (hashElem.offsetParent) {
          offset += hashElem.offsetTop

          hashElem = hashElem.offsetParent
        }
      }
      scrollTo(0, offset)
      $currentLocationWithoutHash = removeHash(newUrl)
    }
    else {
      scrollTo(0, scrollY)
    }
    if ($isChromeForIOS && document.title == title) {
      document.title = title + String.fromCharCode(160)
    }
    else {
      document.title = title
    }
    instantanize()
    bar.done()
    triggerPageEvent('change', false)
    var userscriptEvent = document.createEvent('HTMLEvents')
    userscriptEvent.initEvent('instantclick:newpage', true, true)
    dispatchEvent(userscriptEvent)
  }
  function setPreloadingAsHalted() {
    $isPreloading = false
    $isWaitingForCompletion = false
  }
  function removeNoscriptTags(html) {
    return html.replace(/<noscript[\s\S]+<\/noscript>/gi, '')
  }

  ////////// EVENT HANDLERS //////////
  function mousedown(e) {
    if ($lastTouchTimestamp > (+new Date - 500)) {
      return // Otherwise, click doesn’t fire
    }
    var a = getLinkTarget(e.target)
    if (!a || !isPreloadable(a)) {
      return
    }
    preload(a.href)
  }
  function mouseover(e) {
    if ($lastTouchTimestamp > (+new Date - 500)) {
      return // Otherwise, click doesn’t fire
    }
    var a = getLinkTarget(e.target)
    if (!a || !isPreloadable(a)) {
      return
    }
    a.addEventListener('mouseout', mouseout)
    if (!$delayBeforePreload) {
      preload(a.href)
    }
    else {
      $urlToPreload = a.href
      $preloadTimer = setTimeout(preload, $delayBeforePreload)
    }
  }
  function touchstart(e) {
    $lastTouchTimestamp = +new Date
    var a = getLinkTarget(e.target)
    if (!a || !isPreloadable(a)) {
      return
    }
    if ($preloadOnMousedown) {
      a.removeEventListener('mousedown', mousedown)
    }
    else {
      a.removeEventListener('mouseover', mouseover)
    }
    preload(a.href)
  }

  function click(e) {
    var a = getLinkTarget(e.target)
    if (!a || !isPreloadable(a)) {
      return
    }
    if (e.which > 1 || e.metaKey || e.ctrlKey) { // Opening in new tab
      return
    }
    e.preventDefault()
    display(a.href)
  }

  function mouseout() {
    if ($preloadTimer) {
      clearTimeout($preloadTimer)
      $preloadTimer = false
      return
    }
    if (!$isPreloading || $isWaitingForCompletion) {
      return
    }
    $xhr.abort()
    setPreloadingAsHalted()
  }

  function readystatechange() {
    if ($xhr.readyState < 4) {
      return
    }
    if ($xhr.status == 0) {
      /* Request aborted */
      return
    }

    $timing.ready = +new Date - $timing.start
    if ($xhr.getResponseHeader('Content-Type').match(/\/(x|ht|xht)ml/)) {
      var doc = document.implementation.createHTMLDocument('')
      doc.documentElement.innerHTML = removeNoscriptTags($xhr.responseText)
      $title = doc.title
      $body = doc.body

      var alteredOnReceive = triggerPageEvent('receive', $url, $body, $title)
      if (alteredOnReceive) {
        if ('body' in alteredOnReceive) {
          $body = alteredOnReceive.body
        }
        if ('title' in alteredOnReceive) {
          $title = alteredOnReceive.title
        }
      }

      var urlWithoutHash = removeHash($url)
      $history[urlWithoutHash] = {
        body: $body,
        title: $title,
        scrollY: urlWithoutHash in $history ? $history[urlWithoutHash].scrollY : 0
      }
      var elems = doc.head.children,
          found = 0,
          elem,
          data

      for (var i = elems.length - 1; i >= 0; i--) {
        elem = elems[i]
        if (elem.hasAttribute('data-instant-track')) {
          data = elem.getAttribute('href') || elem.getAttribute('src') || elem.innerHTML
          for (var j = $trackedAssets.length - 1; j >= 0; j--) {
            if ($trackedAssets[j] == data) {
              found++
            }
          }
        }
      }
      if (found != $trackedAssets.length) {
        $mustRedirect = true // Assets have changed
      }
    }
    else {
      $mustRedirect = true // Not an HTML document
    }

    if ($isWaitingForCompletion) {
      $isWaitingForCompletion = false
      display($url)
    }
  }

  ////////// MAIN FUNCTIONS //////////
  function instantanize(isInitializing) {
    document.body.addEventListener('touchstart', touchstart, true)
    if ($preloadOnMousedown) {
      document.body.addEventListener('mousedown', mousedown, true)
    }
    else {
      document.body.addEventListener('mouseover', mouseover, true)
    }
    document.body.addEventListener('click', click, true)

    if (!isInitializing) {
      var scripts = document.body.getElementsByTagName('script'),
          script,
          copy,
          parentNode,
          nextSibling

      for (i = 0, j = scripts.length; i < j; i++) {
        script = scripts[i]
        if (script.hasAttribute('data-no-instant')) {
          continue
        }
        copy = document.createElement('script')
        if (script.src) {
          copy.src = script.src
        }
        if (script.innerHTML) {
          copy.innerHTML = script.innerHTML
        }
        parentNode = script.parentNode
        nextSibling = script.nextSibling
        parentNode.removeChild(script)
        parentNode.insertBefore(copy, nextSibling)
      }
    }
  }

  function preload(url) {
    if (!$preloadOnMousedown
        && 'display' in $timing
        && +new Date - ($timing.start + $timing.display) < 100) {
      return
    }
    if ($preloadTimer) {
      clearTimeout($preloadTimer)
      $preloadTimer = false
    }

    if (!url) {
      url = $urlToPreload
    }

    if ($isPreloading && (url == $url || $isWaitingForCompletion)) {
      return
    }
    $isPreloading = true
    $isWaitingForCompletion = false

    $url = url
    $body = false
    $mustRedirect = false
    $timing = {
      start: +new Date
    }
    triggerPageEvent('fetch')
    $xhr.open('GET', url)
    $xhr.send()
  }

  function display(url) {
    if (!('display' in $timing)) {
      $timing.display = +new Date - $timing.start
    }
    if ($preloadTimer || !$isPreloading) {
      if ($preloadTimer && $url && $url != url) {
        location.href = url
        return
      }

      preload(url)
      bar.start(0, true)
      triggerPageEvent('wait')
      $isWaitingForCompletion = true // Must be set *after* calling `preload`
      return
    }
    if ($isWaitingForCompletion) {
      location.href = url
      return
    }
    if ($mustRedirect) {
      location.href = $url
      return
    }
    if (!$body) {
      bar.start(0, true)
      triggerPageEvent('wait')
      $isWaitingForCompletion = true
      return
    }
    $history[$currentLocationWithoutHash].scrollY = pageYOffset
    setPreloadingAsHalted()
    changePage($title, $body, $url)
  }


  ////////// PROGRESS BAR FUNCTIONS //////////
  var bar = function() {
    var $barContainer,
        $barElement,
        $barTransformProperty,
        $barProgress,
        $barTimer

    function init() {
      $barContainer = document.createElement('div')
      $barContainer.id = 'instantclick'
      $barElement = document.createElement('div')
      $barElement.id = 'instantclick-bar'
      $barElement.className = 'instantclick-bar'
      $barContainer.appendChild($barElement)

      var vendors = ['Webkit', 'Moz', 'O']

      $barTransformProperty = 'transform'
      if (!($barTransformProperty in $barElement.style)) {
        for (var i = 0; i < 3; i++) {
          if (vendors[i] + 'Transform' in $barElement.style) {
            $barTransformProperty = vendors[i] + 'Transform'
          }
        }
      }

      var transitionProperty = 'transition'
      if (!(transitionProperty in $barElement.style)) {
        for (var i = 0; i < 3; i++) {
          if (vendors[i] + 'Transition' in $barElement.style) {
            transitionProperty = '-' + vendors[i].toLowerCase() + '-' + transitionProperty
          }
        }
      }

      var style = document.createElement('style')
      style.innerHTML = '#instantclick{position:' + ($hasTouch ? 'absolute' : 'fixed') + ';top:0;left:0;width:100%;pointer-events:none;z-index:2147483647;' + transitionProperty + ':opacity .25s .1s}'
        + '.instantclick-bar{background:#29d;width:100%;margin-left:-100%;height:2px;' + transitionProperty + ':all .25s}'
      document.head.appendChild(style)
      if ($hasTouch) {
        updatePositionAndScale()
        addEventListener('resize', updatePositionAndScale)
        addEventListener('scroll', updatePositionAndScale)
      }

    }

    function start(at, jump) {
      $barProgress = at
      if (document.getElementById($barContainer.id)) {
        document.body.removeChild($barContainer)
      }
      $barContainer.style.opacity = '1'
      if (document.getElementById($barContainer.id)) {
        document.body.removeChild($barContainer)
      }
      update()
      if (jump) {
        setTimeout(jumpStart, 0)
      }
      clearTimeout($barTimer)
      $barTimer = setTimeout(inc, 500)
    }

    function jumpStart() {
      $barProgress = 10
      update()
    }

    function inc() {
      $barProgress += 1 + (Math.random() * 2)
      if ($barProgress >= 98) {
        $barProgress = 98
      }
      else {
        $barTimer = setTimeout(inc, 500)
      }
      update()
    }

    function update() {
      $barElement.style[$barTransformProperty] = 'translate(' + $barProgress + '%)'
      if (!document.getElementById($barContainer.id)) {
        document.body.appendChild($barContainer)
      }
    }

    function done() {
      if (document.getElementById($barContainer.id)) {
        clearTimeout($barTimer)
        $barProgress = 100
        update()
        $barContainer.style.opacity = '0'
        return
      }
      start($barProgress == 100 ? 0 : $barProgress)
      setTimeout(done, 0)
    }

    function updatePositionAndScale() {
      $barContainer.style.left = pageXOffset + 'px'
      $barContainer.style.width = innerWidth + 'px'
      $barContainer.style.top = pageYOffset + 'px'
      var landscape = 'orientation' in window && Math.abs(orientation) == 90,
          scaleY = innerWidth / screen[landscape ? 'height' : 'width'] * 2
      $barContainer.style[$barTransformProperty] = 'scaleY(' + scaleY  + ')'
    }
    return {
      init: init,
      start: start,
      done: done
    }
  }()


  ////////// PUBLIC VARIABLE AND FUNCTIONS //////////
  var supported = 'pushState' in history
                  && (!$ua.match('Android') || $ua.match('Chrome/'))
                  && location.protocol != "file:"
  function init() {
    if ($currentLocationWithoutHash) {
      /* Already initialized */
      return
    }
    if (!supported) {
      triggerPageEvent('change', true)
      return
    }
    for (var i = arguments.length - 1; i >= 0; i--) {
      var arg = arguments[i]
      if (arg === true) {
        $useWhitelist = true
      }
      else if (arg == 'mousedown') {
        $preloadOnMousedown = true
      }
      else if (typeof arg == 'number') {
        $delayBeforePreload = arg
      }
    }
    $currentLocationWithoutHash = removeHash(location.href)
    $history[$currentLocationWithoutHash] = {
      body: document.body,
      title: document.title,
      scrollY: pageYOffset
    }
    var elems = document.head.children,
        elem,
        data
    for (var i = elems.length - 1; i >= 0; i--) {
      elem = elems[i]
      if (elem.hasAttribute('data-instant-track')) {
        data = elem.getAttribute('href') || elem.getAttribute('src') || elem.innerHTML
        $trackedAssets.push(data)
      }
    }
    $xhr = new XMLHttpRequest()
    $xhr.addEventListener('readystatechange', readystatechange)
    instantanize(true)
    bar.init()
    triggerPageEvent('change', true)
    addEventListener('popstate', function() {
      var loc = removeHash(location.href)
      if (loc == $currentLocationWithoutHash) {
        return
      }
      if (!(loc in $history)) {
        location.href = location.href
        /* Reloads the page while using cache for scripts, styles and images,
           unlike `location.reload()` */
        return
      }
      $history[$currentLocationWithoutHash].scrollY = pageYOffset
      $currentLocationWithoutHash = loc
      changePage($history[loc].title, $history[loc].body, false, $history[loc].scrollY)
    })
  }
  function on(eventType, callback) {
    $eventsCallbacks[eventType].push(callback)
  }
  ////////////////////
  return {
    supported: supported,
    init: init,
    on: on
  }

}(document, location);


// ====================================================================================================================================================


// CALLBACKS
$(document).on('ready',function(){

  

});
