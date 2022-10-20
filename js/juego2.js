import {GLTFLoader} from '../lib/GLTFLoader.module.js'
import * as SkeletonUtils from '../lib/SkeletonUtils.js'
window.addEventListener('load', init, false);

var sceneWidth,sceneHeight,camera,scene,renderer,luzSol,img;
var rollingGroundSphere,heroSphere, animFrame;
var rollingSpeed=0.004;
var heroRollingSpeed;
var worldRadius=26;
var heroRadius=0.2;
var sphericalHelper;
var pathAngleValues;
var heroBaseY=2;
var gravity=0.005;
var leftLane=-1;
var rightLane=1;
var middleLane=0;
var currentLane;
var laneChangeSpeed = 7;
var clock,clock2;
var escalaMonstruo = 0.00125;
var godzillaReleaseInterval=0.35;
var godzillasInPath;
var godzillasPool;
var stats,scoreText,score,botonFacil,botonNormal,botonDificil, godzilla;
var hasCollided, enPartida = false;

function menu(dificultad){
	if(dificultad === "facil"){
		rollingSpeed = 0.003;
		godzillaReleaseInterval=0.5;
	}else if(dificultad === "facil"){
		rollingSpeed = 0.004;
		godzillaReleaseInterval=0.35;
	}else{
		rollingSpeed = 0.005;
		godzillaReleaseInterval=0.28;
	}
	clock2.start();
	newGodzillasPool();
	enPartida = true;
	botonFacil.remove();
	botonNormal.remove();
	botonDificil.remove();
	img.style.width = "100px";
	img.style.height = "100px";
	img.style.left = "auto";
	img.style.right = "1px";
	img.style.top = "2px";

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

	img = document.createElement('img');
	img.src = '../textures/logoKaiju.png';
	img.style.position = 'absolute';
	img.style.width = "200px";
	img.style.height = "200px";
	img.style.left = "calc(50% - 100px)";
	img.style.top = "2px";
	document.body.appendChild(img);
}

function init(time) {
	var audio = new Audio('../sounds/ost.mp3');
	hasCollided=false;
	score=0;
	godzillasInPath=[];
	godzillasPool=[];
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
	new GLTFLoader().load('../models/godzilla.glb',
		function ( gltf ) {
			gltf.scene.scale.set(escalaMonstruo,escalaMonstruo,escalaMonstruo)
			gltf.scene.position.set(0,1.9,0)
			godzilla = gltf.scene;
			gltf.scene.traverse( function( node ) { //Hace que pueda tener y recibir sombras
				if ( node.isMesh ) { node.castShadow = true; }
			} );
			addWorld();
			addHero();
			addLight();
			botonesInicio(); //Crea los botones de selección de dificultad

			update();
		},
		function ( xhr ) {
			console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
		},
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
	scoreText.style.width = 100;
	scoreText.style.height = 100;
	scoreText.innerHTML = "0";
	scoreText.style.top = 10 + 'px';
	scoreText.style.left = 200 + 'px';
	scoreText.style.color = 'white';
	scoreText.style.fontSize = "28px";
	scoreText.style.fontFamily = "fantasy";
	document.body.appendChild(scoreText);
	audio.addEventListener("canplaythrough", () => { //Navegador no permite sonido hasta no hacer click
		audio.play().catch(e => {
		   window.addEventListener('click', () => {
				audio.play();
		   }, { once: true })
		})
	 });
}

function newGodzillasPool(){
	var maxgodzillasInPool=10;
	var newgodzilla;
	for(var i=0; i<maxgodzillasInPool;i++){
		newgodzilla=newGodzilla();
		godzillasPool.push(newgodzilla);
	}
}
function handleKeyDown(keyEvent){
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
	}
	//heroSphere.position.x=currentLane;
}

function addHero(){
	var sphereGeometry = new THREE.SphereGeometry( heroRadius, 80);
	var sphereMaterial = new THREE.MeshLambertMaterial({ map: new THREE.TextureLoader().load(
        '../textures/luna.jpg'
    )})
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
	addWorldgodzillas();
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
function addPathgodzilla(){
	var options=[0,1,2];
	var lane= Math.floor(Math.random()*3);
	addgodzilla(true,lane);
	options.splice(lane,1);
	if(Math.random()>0.5){
		lane= Math.floor(Math.random()*2);
		addgodzilla(true,options[lane]);
	}
}
function addWorldgodzillas(){
	var numgodzillas=36;
	var gap=6.28/36;
	for(var i=0;i<numgodzillas;i++){
		addgodzilla(false,i*gap, true);
		addgodzilla(false,i*gap, false);
	}
}
function addgodzilla(inPath, row, isLeft){
	var newgodzilla;
	if(inPath){
		if(godzillasPool.length==0)return;
		newgodzilla=godzillasPool.pop();
		newgodzilla.visible=true;
		godzillasInPath.push(newgodzilla);
		sphericalHelper.set( worldRadius-0.3, pathAngleValues[row], -rollingGroundSphere.rotation.x+4 );
	}else{
		newgodzilla=newGodzilla();
		var forestAreaAngle=0;//[1.52,1.57,1.62];
		if(isLeft){
			forestAreaAngle=1.8;
		}else{
			forestAreaAngle=1.4;
		}
		sphericalHelper.set( worldRadius-0.3, forestAreaAngle, row );
	}
	newgodzilla.position.setFromSpherical( sphericalHelper );
	var rollingGroundVector=rollingGroundSphere.position.clone().normalize();
	var godzillaVector=newgodzilla.position.clone().normalize();
	newgodzilla.quaternion.setFromUnitVectors(godzillaVector,rollingGroundVector);
	newgodzilla.rotation.x+=(Math.random()*(2*Math.PI/10))+-Math.PI/10;
	
	rollingGroundSphere.add(newgodzilla);
}
function newGodzilla(){
	return SkeletonUtils.clone(godzilla);
}

function update(time,timeAnt){
	if(!hasCollided){
		console.log()
		stats.update();
		//animate
		var delta = clock2.getDelta()
		rollingGroundSphere.rotation.x += rollingSpeed * delta * 100;
		heroSphere.rotation.x -= heroRollingSpeed * delta * 150;
		heroSphere.position.x=THREE.Math.lerp(heroSphere.position.x,currentLane, laneChangeSpeed*clock.getDelta());//clock.getElapsedTime());

		if(!hasCollided && enPartida){
			score+=1000*rollingSpeed*(1/godzillaReleaseInterval) * delta
			scoreText.innerHTML="Puntuación: " + Math.round(score).toString();
		}

		if(clock.getElapsedTime()>godzillaReleaseInterval){ //Se actualiza la puntuación aquí para ser independiente de fps
			clock.start();
			addPathgodzilla();
		}
		dogodzillaLogic();
		render();
		animFrame = requestAnimationFrame(update);
	}
}
function dogodzillaLogic(){
	var onegodzilla;
	var godzillaPos = new THREE.Vector3();
	var godzillasToRemove=[];
	godzillasInPath.forEach( function ( element, index ) {
		onegodzilla=godzillasInPath[ index ];
		godzillaPos.setFromMatrixPosition( onegodzilla.matrixWorld );
		if(godzillaPos.z>6 &&onegodzilla.visible){//gone out of our view zone
			godzillasToRemove.push(onegodzilla);
		}else{//check collision
			if(godzillaPos.distanceTo(heroSphere.position)<=0.6){
				hasCollided=true;
				gameOver();
			}
		}
	});
	var fromWhere;
	godzillasToRemove.forEach( function ( element, index ) {
		onegodzilla=godzillasToRemove[ index ];
		fromWhere=godzillasInPath.indexOf(onegodzilla);
		godzillasInPath.splice(fromWhere,1);
		godzillasPool.push(onegodzilla);
		onegodzilla.visible=false;
		console.log("remove godzilla");
	});
}

function render(){
    renderer.render(scene, camera);
}

function gameOver () { //Fin de partida
  var audio = new Audio('../sounds/godScream.ogg');
  audio.volume = 0.5;
  audio.play();

  var botonEnd = document.createElement('button');
  botonEnd.innerHTML = "Volver a intentar";
  botonEnd.onclick = function(){location.reload()};

  botonEnd.style.position = 'absolute';
  botonEnd.style.width = "100px";
  botonEnd.style.height = "50px";
  botonEnd.style.left = "calc(50% - 50px)";
  botonEnd.style.top = "calc(40%)";
  botonEnd.style.border = "thick solid #FFFFFF";
  botonEnd.style.opacity = "0.7";
  botonEnd.style.borderRadius = "4px";

  document.body.append(botonEnd);
}

function updateAspectRatio() { //Se asegura que la cámara no se distorsione al modificar el aspect ratio
	sceneHeight = window.innerHeight;
	sceneWidth = window.innerWidth;
	renderer.setSize(sceneWidth, sceneHeight);
	camera.aspect = sceneWidth/sceneHeight;
	camera.updateProjectionMatrix();
}