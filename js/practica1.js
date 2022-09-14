var _width = 800;
var _height = 800;
/* To display anything, need a scene, a camera, and renderer */
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 
  90, //field of view
  _width/_height, //aspect ratio width/height
  0.1, //near
  1000 //far
);
camera.position.z = _width;
camera.position.y = - _width;
camera.position.x = _width;

var renderer = new THREE.WebGLRenderer();
renderer.setSize( _width, _height );
document.body.appendChild( renderer.domElement );

geometry = new THREE.Geometry();
geometry.vertices.push(new THREE.Vector3(0, 0, 0)); //x, y, z
geometry.vertices.push(new THREE.Vector3(450, -800, 0));
/* linewidth on windows will always be 1 */
material = new THREE.LineBasicMaterial( { color: 0x0000ff, linewidth: 5 } );
line = new THREE.Line(geometry, material);
scene.add(line);

var render = function() {
  renderer.render(scene, camera);
}

var animate = function() {
  requestAnimationFrame( animate );
	render();  
};

animate();
var mouse = {x:0, y:0};
window.addEventListener('mousedown', function(e) {
  mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
  mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
  console.log(mouse.x, -mouse.y); 
  geometry = new THREE.Geometry();
	geometry.vertices.push(new THREE.Vector3(0, 0, 0)); //x, y, z
	geometry.vertices.push(new THREE.Vector3(mouse.x, -mouse.y, 0));
	/* linewidth on windows will always be 1 */
	line = new THREE.Line(geometry, material);
	scene.add(line);
}, false);