# Angular Image Color Replacement
Do you like Photoshop `Replace Color` tool? Then you will like this directive!

# Example
### Original
```html
<img src="myimage.png" />
```
![alt original](http://girlgotfaith.com/wp-content/uploads/2015/10/wp-cloudy-simple.png)

---------------------------------------

### Using Image Color Replacement

```javascript
// Your controller
$scope.replace = [
  {from: '#FF0000', to:'#FFFF00'}, //replace Red to Yellow
  {from: '#00FF00', to:'#00A4FF', tolerance: 50} //replace Green to Blue with tolerance 50
]
```
```html
<img src="myimage.png" replace="replace" />
```
![alt original](http://girlgotfaith.com/wp-content/uploads/2015/10/wp-cloudy-simple.png)

---------------------------------------

# How to use
`bower install angular-image-color-replacement --save-dev`

Put on html head:
```html
<script type="text/javascript" src="your_bower_components/angular/angular.min.js"></script><!-- Mandatory -->
<script type="text/javascript" src="your_bower_components/angular-image-color-replacement/dist/angular-image-color-replacement"></script>
```

Angular module:
```javascript
angular.module("MyApp", ['color-replace'])
```

Your controller:
```javascript
// Your controller
$scope.replace = [
  {from: '#FF0000', to:'#FFFF00'}, //replace Red to Yellow
  {from: '#00FF00', to:'#00A4FF', tolerance: 50} //replace Green to Blue with tolerance 50
]
```

Your view
```html
<img src="myimage.png" replace="replace" />
```
