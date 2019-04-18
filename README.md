# Cube Visualization
[![Code Style: Google](https://img.shields.io/badge/code%20style-google-blueviolet.svg)](https://github.com/google/gts)
![GitHub](https://img.shields.io/github/license/georgePadolsey/cube-visualisation-component.svg)


A simple component designed to create cool 3d sine wave in cube visualization:

![Cube Visulization Demo](https://blog.georgep.co.uk/Cube-Visualisation-Component/example_demo.gif)


# How to run

To run it either install it as an npm package and import the package as so:

```javascript
import {Container} from 'cube-visualisation-component';
```

or in a browser:
```html
<script src="{Folder where this component is}/dist/index.js"></script>
<!-- Exposed globally under CubeVisualizer -->
<script>
    new CubeVisualizer.Visualizer(document.body, window.innerWidth, window.innerHeight)
</script>
```


# How to build

To build you can simply run: 
- `npm run build`

To build the documentation you run: 
- `npm run docs`


# API 

View the [full documentation and usage here](https://blog.georgep.co.uk/Cube-Visualisation-Component/docs/).

There's a good amount of customisation available via the ConfigObject though feel free to copy the code.

# Why

Originally I built this visualization for [my website](https://www.georgep.co.uk/) (shameless plug) as a cool background. However that relied heavily on a library called [MathBox](https://gitgud.io/unconed/mathbox) which is, unfortunately, no longer actively developed. It is an amazing project in it's own right. Though I wanted to see if I could replicate the same effect with just [Three.JS](https://threejs.org/). 

![Website example](website_example.gif)

This project is not completely there yet -- it has no locking to the grid. Though currently I believe the spline between points is a good compromise. To lock to the grid it will mean walking cubically between each point. Additionally, the current project is not completely performant. I am looking currently at optimising it.

# Testing

Since this is a visualization meant to create a nice visual it doesn't have many parts which can be tested. It doesn't have to be mathematically accurate, it just has to make a nice looking output. Though, it does need to bind itself to the page correctly. 

This can be tested all by simply running the MainTest example and seeing that it performs a suitable output.

If this project is further complicated and generalised, it might be worth adding a testing framework.


# License

MIT - See LICENSE