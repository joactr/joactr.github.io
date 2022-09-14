/* To display anything, need a scene, a camera, and renderer */
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
scene.background = new THREE.Color( 0xff0000 );

camera.position.z = 100;

var renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );


let lastPunto = new THREE.Vector3(0, 0, 0)
document.body.appendChild( renderer.domElement );
material = new THREE.LineBasicMaterial( { color: 0x42f57b, linewidth: 50 } );


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
  mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  



  console.log(mouse.x, -mouse.y); 
  let puntos = [];
  puntos.push(lastPunto); //x, y, z
  let vector = new THREE.Vector3(mouse.x, mouse.y, 0)

  vector.unproject(camera);
  puntos.push(vector);
  lastPunto = vector;
  let geometry = new THREE.BufferGeometry().setFromPoints( puntos );
  line = new THREE.Line(geometry, material);
  scene.add(line);
	/* linewidth on windows will always be 1 */
}, false);