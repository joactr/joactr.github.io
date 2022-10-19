import {GLTFLoader} from '../lib/GLTFLoader.module.js'
import * as SkeletonUtils from '../lib/SkeletonUtils.js'
window.addEventListener('load', init, false);

var sceneWidth,sceneHeight,camera,scene,renderer,luzSol;
var ground,orbitControl,rollingGroundSphere,heroSphere;
var rollingSpeed=0.004;
var heroRollingSpeed;
var worldRadius=26;
var heroRadius=0.2;
var sphericalHelper;
var pathAngleValues;
var heroBaseY=2;
var bounceValue=0.1;
var gravity=0.005;
var leftLane=-1;
var rightLane=1;
var middleLane=0;
var currentLane;
var laneChangeSpeed = 7;
var clock,clock2;
var escalaMonstruo = 0.00125;
var jumping;
var treeReleaseInterval=0.35;
var lastTreeReleaseTime=0;
var treesInPath;
var treesPool;
var particleGeometry;
var particleCount=20;
var explosionPower =1.06;
var particles;
var stats,scoreText,score,botonFacil,botonNormal,botonDificil, godzilla;
var hasCollided, enPartida = false;
let timeAnt = 0;

function menu(dificultad){
	if(dificultad === "facil"){
		rollingSpeed = 0.003;
		treeReleaseInterval=0.5;
	}else if(dificultad === "facil"){
		rollingSpeed = 0.004;
		treeReleaseInterval=0.35;
	}else{
		rollingSpeed = 0.005;
		treeReleaseInterval=0.28;
	}
	clock2.start();
	newGodzillasPool();
	enPartida = true;
	botonFacil.remove();
	botonNormal.remove();
	botonDificil.remove();

}

function botonesInicio(){ //Crea los botones de inicio y los estiliza con css
	botonFacil = document.createElement('button');
	botonNormal = document.createElement('button');
	botonDificil = document.createElement('button');

	botonFacil.onclick = function(){menu("facil")};
	botonNormal.onclick = function(){menu("normal")};
	botonDificil.onclick = function(){menu("dificil")};

	botonFacil.innerHTML = "Paseo espacial";
	botonNormal.innerHTML = "Amenaza";
	botonDificil.innerHTML = "Catástrofe cósmica";
	
	botonFacil.style.position = 'absolute';
	botonFacil.style.width = "100px";
	botonFacil.style.height = "50px";
	botonFacil.style.left = "calc(50% - 50px)";
	botonFacil.style.top = "calc(30%)";
	botonFacil.style.border = "thick solid #FFFFFF";
	botonFacil.style.opacity = "0.7";
	botonFacil.style.borderRadius = "4px";

	botonNormal.style.position = 'absolute';
	botonNormal.style.width = "100px";
	botonNormal.style.height = "50px";
	botonNormal.style.left = "calc(50% - 50px)";
	botonNormal.style.top = "calc(40%)";
	botonNormal.style.border = "thick solid #FFFFFF";
	botonNormal.style.opacity = "0.7";
	botonNormal.style.borderRadius = "4px";

	botonDificil.style.position = 'absolute';
	botonDificil.style.width = "100px";
	botonDificil.style.height = "50px";
	botonDificil.style.left = "calc(50% - 50px)";
	botonDificil.style.top = "calc(50%)";
	botonDificil.style.border = "thick solid #FFFFFF";
	botonDificil.style.opacity = "0.7";
	botonDificil.style.borderRadius = "4px";

	document.body.appendChild(botonFacil);
	document.body.appendChild(botonNormal);
	document.body.appendChild(botonDificil);
}

function init(time) {
	// set up the scene
	createScene();

	
	
}

function createScene(){
	var audio = new Audio('../sounds/ost.mp3');
	audio.volume = 0.4;
	hasCollided=false;
	score=0;
	treesInPath=[];
	treesPool=[];
	clock=new THREE.Clock();
	clock.start();
	clock2=new THREE.Clock();
	heroRollingSpeed=(rollingSpeed*worldRadius/heroRadius)/5;
	sphericalHelper = new THREE.Spherical();
	pathAngleValues=[1.52,1.57,1.62];
    sceneWidth=window.innerWidth;
    sceneHeight=window.innerHeight;
    scene = new THREE.Scene();//the 3d scene
    scene.fog = new THREE.FogExp2( 0xf0fff0, 0.04 );
    camera = new THREE.PerspectiveCamera( 60, sceneWidth / sceneHeight, 0.1, 1000 );//perspective camera
    renderer = new THREE.WebGLRenderer({alpha:true});//renderer with transparent backdrop
    renderer.setClearColor(0xfffafa, 1); 
    renderer.shadowMap.enabled = true;//enable shadow
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize( sceneWidth, sceneHeight );
	document.body.appendChild(renderer.domElement);
	stats = new Stats();
	document.body.appendChild(stats.dom);
	new GLTFLoader().load(
		// resource URL
		'../models/godzilla.glb',
		// called when the resource is loaded
		function ( gltf ) {
			gltf.scene.scale.set(escalaMonstruo,escalaMonstruo,escalaMonstruo)
			gltf.scene.position.set(0,1.9,0)
			godzilla = gltf.scene;
			godzilla.receiveShadow = true;
			godzilla.castShadow = true;
			addWorld();
			addHero();
			addLight();
			addExplosion();
			botonesInicio(); //Crea los botones de selección de dificultad

			update();
		},
		// called while loading is progressing
		function ( xhr ) {
			console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
		},
		// called when loading has errors
		function ( error ) {
			console.log( 'An error happened' );
		}
	);

	camera.position.set(0,3.5,6.5);
	camera.rotation.x = -0.5
	console.log(camera)

	
	window.addEventListener('resize', updateAspectRatio, false);// Función de re-escalado

	document.onkeydown = handleKeyDown;
	
	scoreText = document.createElement('div');
	scoreText.style.position = 'absolute';
	//text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
	scoreText.style.width = 100;
	scoreText.style.height = 100;
	//scoreText.style.backgroundColor = "blue";
	scoreText.innerHTML = "0";
	scoreText.style.top = 30 + 'px';
	scoreText.style.left = 200 + 'px';
	scoreText.style.color = 'white';
	document.body.appendChild(scoreText);
	audio.addEventListener("canplaythrough", () => {
		audio.play().catch(e => {
		   window.addEventListener('click', () => {
				
				audio.play();
			  
		   }, { once: true })
		})
	 });


}
function addExplosion(){
	/*particleGeometry = new THREE.BufferGeometry();
	for (var i = 0; i < particleCount; i ++ ) {
		var vertex = new THREE.Vector3();
		particleGeometry.vertices.push( vertex );
	}
	var pMaterial = new THREE.ParticleBasicMaterial({
	  color: 0xfffafa,
	  size: 0.2
	});
	particles = new THREE.Points( particleGeometry, pMaterial );
	scene.add( particles );
	particles.visible=false;*/
}
function newGodzillasPool(){
	var maxTreesInPool=10;
	var newTree;
	for(var i=0; i<maxTreesInPool;i++){
		newTree=newGodzilla();
		treesPool.push(newTree);
	}
}
function handleKeyDown(keyEvent){
	if(jumping)return;
	var validMove=true;
	if ( keyEvent.keyCode === 37) {//left
		if(currentLane==middleLane){
			currentLane=leftLane;
		}else if(currentLane==rightLane){
			currentLane=middleLane;
		}else{
			validMove=false;	
		}
	} else if ( keyEvent.keyCode === 39) {//right
		if(currentLane==middleLane){
			currentLane=rightLane;
		}else if(currentLane==leftLane){
			currentLane=middleLane;
		}else{
			validMove=false;	
		}
	}else{
		if ( keyEvent.keyCode === 38){//up, jump
			bounceValue=0.1;
			jumping=true;
		}
		validMove=false;
	}
	//heroSphere.position.x=currentLane;
	if(validMove){
		jumping=true;
		bounceValue=0.06;
	}
}
function addHero(){
	var sphereGeometry = new THREE.SphereGeometry( heroRadius, 80);
	var sphereMaterial = new THREE.MeshLambertMaterial({ map: new THREE.TextureLoader().load(
        '../textures/luna.jpg'
    )})
	jumping=false;
	heroSphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
	heroSphere.receiveShadow = true;
	heroSphere.castShadow=true;
	scene.add( heroSphere );
	currentLane=middleLane;
	heroSphere.position.set(currentLane,heroBaseY,4.8)
}
function addWorld(){
	new THREE.TextureLoader().load('../images/space.jpeg' , function(texture)
	{
	 scene.background = texture;  
	});
	var sphereGeometry = new THREE.SphereGeometry( worldRadius, 100,100);
	var sphereMaterial = new THREE.MeshLambertMaterial({ map: new THREE.TextureLoader().load(
        '../textures/tierra_8k.jpg'
    )})
	rollingGroundSphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
	rollingGroundSphere.receiveShadow = true;
	rollingGroundSphere.rotation.z=-Math.PI/2;
	scene.add( rollingGroundSphere ); //Agregamos la tierra a la escena
	rollingGroundSphere.position.set(rollingGroundSphere.position.x,-24,2) //Situamos la tierra
	addWorldTrees();
}
function addLight(){
	var hemisphereLight = new THREE.HemisphereLight(0xfffafa,0x000000, 0.7)
	scene.add(hemisphereLight);
	luzSol = new THREE.DirectionalLight( 0xC8C9AB, 0.9);
	luzSol.position.set( 12,6,-7 );
	luzSol.castShadow = true;
	scene.add(luzSol);
	//Set up shadow properties for the luzSol light
	luzSol.shadow.mapSize.width = 256;
	luzSol.shadow.mapSize.height = 256;
	luzSol.shadow.camera.near = 0.5;
	luzSol.shadow.camera.far = 50 ;

    var focal = new THREE.SpotLight('white', 0.05);
    focal.position.set(0, 40, 10);
    focal.target.position.set(0, 0, 0);
    focal.angle = Math.PI / 7;
    focal.penumbra = 0.2;

    focal.shadow.camera.near = 20;
    focal.shadow.camera.far = 1500;
    focal.shadow.camera.fov = 4000;
    focal.shadow.mapSize.width = 10000;
    focal.shadow.mapSize.height = 10000;

    scene.add(focal.target);
    focal.castShadow = true;
    scene.add(focal);
}
function addPathTree(){
	var options=[0,1,2];
	var lane= Math.floor(Math.random()*3);
	addTree(true,lane);
	options.splice(lane,1);
	if(Math.random()>0.5){
		lane= Math.floor(Math.random()*2);
		addTree(true,options[lane]);
	}
}
function addWorldTrees(){
	var numTrees=36;
	var gap=6.28/36;
	for(var i=0;i<numTrees;i++){
		addTree(false,i*gap, true);
		addTree(false,i*gap, false);
	}
}
function addTree(inPath, row, isLeft){
	var newTree;
	if(inPath){
		if(treesPool.length==0)return;
		newTree=treesPool.pop();
		newTree.visible=true;
		treesInPath.push(newTree);
		sphericalHelper.set( worldRadius-0.3, pathAngleValues[row], -rollingGroundSphere.rotation.x+4 );
	}else{
		newTree=newGodzilla();
		var forestAreaAngle=0;//[1.52,1.57,1.62];
		if(isLeft){
			forestAreaAngle=1.8;
		}else{
			forestAreaAngle=1.4;
		}
		sphericalHelper.set( worldRadius-0.3, forestAreaAngle, row );
	}
	newTree.position.setFromSpherical( sphericalHelper );
	var rollingGroundVector=rollingGroundSphere.position.clone().normalize();
	var treeVector=newTree.position.clone().normalize();
	newTree.quaternion.setFromUnitVectors(treeVector,rollingGroundVector);
	newTree.rotation.x+=(Math.random()*(2*Math.PI/10))+-Math.PI/10;
	
	rollingGroundSphere.add(newTree);
}
function newGodzilla(){
	var g = SkeletonUtils.clone(godzilla);
	g.castShadow = true;
	return g
}

function update(time,timeAnt){
	console.log()
	stats.update();
    //animate
	var delta = clock2.getDelta()
    rollingGroundSphere.rotation.x += rollingSpeed * delta * 100;
    heroSphere.rotation.x -= heroRollingSpeed * delta * 150;
    if(heroSphere.position.y<=heroBaseY){
    	jumping=false;
    	bounceValue=(Math.random()*0.04)+0.005;
    }
    //heroSphere.position.y+=bounceValue;
    heroSphere.position.x=THREE.Math.lerp(heroSphere.position.x,currentLane, laneChangeSpeed*clock.getDelta());//clock.getElapsedTime());
    bounceValue-=gravity * delta * 1000;

	if(!hasCollided && enPartida){
		score+=1000*rollingSpeed*(1/treeReleaseInterval) * delta
		scoreText.innerHTML="Puntuación: " + Math.round(score).toString();
	}

    if(clock.getElapsedTime()>treeReleaseInterval){ //Se actualiza la puntuación aquí para ser independiente de fps
    	clock.start();
    	addPathTree();
    }
    doTreeLogic();
    doExplosionLogic();
    render();
	requestAnimationFrame(update);
}
function doTreeLogic(){
	var oneTree;
	var treePos = new THREE.Vector3();
	var treesToRemove=[];
	treesInPath.forEach( function ( element, index ) {
		oneTree=treesInPath[ index ];
		treePos.setFromMatrixPosition( oneTree.matrixWorld );
		if(treePos.z>6 &&oneTree.visible){//gone out of our view zone
			treesToRemove.push(oneTree);
		}else{//check collision
			if(treePos.distanceTo(heroSphere.position)<=0.6){
				console.log("hit");
				hasCollided=true;
			}
		}
	});
	var fromWhere;
	treesToRemove.forEach( function ( element, index ) {
		oneTree=treesToRemove[ index ];
		fromWhere=treesInPath.indexOf(oneTree);
		treesInPath.splice(fromWhere,1);
		treesPool.push(oneTree);
		oneTree.visible=false;
		console.log("remove tree");
	});
}
function doExplosionLogic(){
	/*if(!particles.visible)return;
	for (var i = 0; i < particleCount; i ++ ) {
		particleGeometry.vertices[i].multiplyScalar(explosionPower);
	}
	if(explosionPower>1.005){
		explosionPower-=0.001;
	}else{
		particles.visible=false;
	}
	particleGeometry.verticesNeedUpdate = true;*/
}
function render(){
    renderer.render(scene, camera);//draw
}
function gameOver () {
  //cancelAnimationFrame( globalRenderID );
  //window.clearInterval( powerupSpawnIntervalID );
}
function updateAspectRatio() { //Se asegura que la cámara no se distorsione al modificar el aspect ratio
	sceneHeight = window.innerHeight;
	sceneWidth = window.innerWidth;
	renderer.setSize(sceneWidth, sceneHeight);
	camera.aspect = sceneWidth/sceneHeight;
	camera.updateProjectionMatrix();
}