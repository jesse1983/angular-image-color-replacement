class ImageReplacer
	@original = null
	@canvas = null

	constructor: (image, @drawMap = [])->
		@original = image
		@canvas = imageToCanvas(image)
		@ctx = context2d(@canvas)
		@drawed = drawImage(@ctx, image)

	# private
	rgbToHex = (RGB)->
		RGB = RGB.replace("#","")
		arr = []
		if RGB.length == 6
			for i in [0,1,2]
				arr.push parseInt(RGB.substr(i*2,2),16)
		arr
	imageToCanvas = (image)->
		c = document.createElement('canvas')
		c.width = image.width
		c.height = image.height
		c
	context2d = (canvas)->
		if canvas
			canvas.getContext("2d")
	drawImage = (ctx, image)->
		ctx.drawImage(image, 0, 0, image.width, image.height)
		imageData = ctx.getImageData(0, 0, image.width, image.height)
		imageData
	proximity = (n1, n2)->
		Math.abs(n1-n2)

	isnear = (n1,n2,tolerance)->
		if n1 > n2
			(n1 < (n2 + tolerance))
		else
			(n1 > (n2 - tolerance))

	saveMap = (drawMap, replace, coordinates, to)->
		unless drawMap[replace]?
			drawMap[replace] = []
		drawMap[replace].push {c: coordinates, to: to}
		return drawMap

	# public
	replaceColors: (objReplace)->
		start = new Date().getTime()
		if objReplace
			if objReplace.length > 0
				if Object.keys(@drawMap).length == 0
					@replaceWithoutMap objReplace
				else 
					@replaceWithMap objReplace
			@ctx.putImageData(@drawed, 0, 0)
		else
			false
		end = new Date().getTime()
		# console.log (end - start)
		true

	replaceWithoutMap: (objReplace)->
		i = 0
		while i < @drawed.data.length
			for r in objReplace
				from = rgbToHex(r.from)
				to = rgbToHex(r.to)
				r.tolerance = 10 unless r.tolerance
				if (
					proximity(@drawed.data[i+0],from[0]) <= r.tolerance and
				  	proximity(@drawed.data[i+1],from[1]) <= r.tolerance and
				  	proximity(@drawed.data[i+2],from[2]) <= r.tolerance
				)

					@drawMap = saveMap(@drawMap, r.from, i, objReplace.indexOf(r))
					@drawed.data[i+0] = to[0]
					@drawed.data[i+1] = to[1]
					@drawed.data[i+2] = to[2]
			i += 4

	replaceWithMap: (objReplace)->
		for color of @drawMap
			for c in @drawMap[color]
				to = rgbToHex(objReplace[c.to].to) 
				@drawed.data[c.c + 0] = to[0]
				@drawed.data[c.c + 1] = to[1]
				@drawed.data[c.c + 2] = to[2]

	replaceHex: (objReplace)->
		arr = []
		if objReplace
			for i in objReplace
				arr.push [rgbToHex(i.from),rgbToHex(i.to)]
		arr

	toDataURL: (params = 'image/png')->
		url = null
		url = @canvas.toDataURL(params) if @canvas?			
		@original = null
		@canvas = null
		@ctx = null
		@drawed = null
		url




if angular?
	class ImageReplacerDirective
		link = (scope, el, attr, ctrl)->
			@original = new Image()
			@map = []

			replace = (original, colorReplace, el)=>
				el.classList.toggle('loading')
				currentImage = new Image()
				currentImage.crossOrigin = "anonymous"
				currentImage.onload = =>
					replacer = new ImageReplacer(currentImage, @map)
					replacer.replaceColors(colorReplace)
					@map = replacer.drawMap 
					el.src = replacer.toDataURL()
					el.classList.remove('loading')
				currentImage.src = original.src			
			
			if el[0].src?
				@original.src = el[0].src
				replace(@original,scope.colorReplace, el[0])

			if scope.ngSrc?
				scope.$watch 'ngSrc', (n, o)=>
					if n?
						@original.src = scope.ngSrc

			scope.$watch 'colorReplace', (n, o)=>
				if n?
					if @original.src?
						replace(@original,n, el[0])
			,true


		constructor: ->
			directive =
				restrict: "A"
				link: link
				scope:
					colorReplace: "="
					ngSrc: "@?"

			return directive


	ImageReplacerDirective.$inject = []


	angular
		.module('color-replace',[])
		.directive 'colorReplace', ImageReplacerDirective
