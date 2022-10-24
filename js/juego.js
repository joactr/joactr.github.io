import {GLTFLoader} from '../lib/GLTFLoader.module.js'
import * as SkeletonUtils from '../lib/SkeletonUtils.js'
window.addEventListener('load', init, false);

var sceneWidth,sceneHeight,camera,scene,renderer,luzSol,img;
var tierraBola,bolaProta;
var velRuede=0.004;
var velocidadRuedeBola;
var sphericalHelper,caminoAngleValues;
var caminoIzq=-1,caminoDer=1,caminoMid=0,currentLane,velCambioCamino = 7;
var reloj,reloj2; //Relojes para animación y control de tiempo
var escalaMonstruo = 0.0015;
var godzillaReleaseInterval=0.35;
var godzillasCamino,godzillasPool;
var stats,scoreText,score,botonFacil,botonNormal,botonDificil, godzilla;
var haChocado, enPartida = false;

function menu(dificultad){ //Se ha apretado un botón de inicio, empezamos
	if(dificultad === "facil"){
		velRuede = 0.003;
		godzillaReleaseInterval=0.5;
	}else if(dificultad === "facil"){
		velRuede = 0.004;
		godzillaReleaseInterval=0.35;
	}else{
		velRuede = 0.006;
		godzillaReleaseInterval=0.28;
	}
	reloj2.start();
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
	botonFacil.style.zIndex = "5";

	botonNormal.style.position = 'absolute';
	botonNormal.style.width = "100px";
	botonNormal.style.height = "50px";
	botonNormal.style.left = "calc(50% - 50px)";
	botonNormal.style.top = "calc(40%)";
	botonNormal.style.border = "thick solid #FFFFFF";
	botonNormal.style.opacity = "0.7";
	botonNormal.style.borderRadius = "4px";
	botonNormal.style.zIndex = "5";

	botonDificil.style.position = 'absolute';
	botonDificil.style.width = "100px";
	botonDificil.style.height = "50px";
	botonDificil.style.left = "calc(50% - 50px)";
	botonDificil.style.top = "calc(50%)";
	botonDificil.style.border = "thick solid #FFFFFF";
	botonDificil.style.opacity = "0.7";
	botonDificil.style.borderRadius = "4px";
	botonDificil.style.zIndex = "5";

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
	haChocado=false;
	score=0;
	godzillasCamino=[];
	godzillasPool=[];
	reloj=new THREE.Clock();
	reloj.start();
	reloj2=new THREE.Clock();
	velocidadRuedeBola=(velRuede*26/0.2)/5;
	sphericalHelper = new THREE.Spherical();
	caminoAngleValues=[1.52,1.57,1.62];
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
			agregarBola();
			addLight();
			botonesInicio(); //Crea los botones de selección de dificultad

			update();
		},
		function ( xhr ) {
			console.log( ( xhr.loaded / xhr.total * 100 ) + '% cargado' );
		},
		function ( error ) {
			console.log( 'Error al cargar godzilla inicialmente' );
		}
	);

	camera.position.set(0,3.5,6.5);
	camera.rotation.x = -0.5

	
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
function handleKeyDown(keyEvent){ //Atención a eventos de teclado
	if ( keyEvent.keyCode === 37) {//izquierda
		if(currentLane==caminoMid){
			currentLane=caminoIzq;
		}else if(currentLane==caminoDer){
			currentLane=caminoMid;
		}
	} else if ( keyEvent.keyCode === 39) {//derecha
		if(currentLane==caminoMid){
			currentLane=caminoDer;
		}else if(currentLane==caminoIzq){
			currentLane=caminoMid;
		}
	}
}

function agregarBola(){
	var sphereGeometry = new THREE.SphereGeometry( 0.2, 80);
	var sphereMaterial = new THREE.MeshLambertMaterial({ map: new THREE.TextureLoader().load(
        '../textures/luna.jpg'
    )})
	bolaProta = new THREE.Mesh( sphereGeometry, sphereMaterial );
	bolaProta.receiveShadow = true;
	bolaProta.castShadow=true;
	scene.add( bolaProta );
	currentLane=caminoMid;
	bolaProta.position.set(currentLane,2,4.8)
}

function addWorld(){
	new THREE.TextureLoader().load('../images/space.jpg' , function(texture)
	{
	 scene.background = texture;  
	});
	var sphereGeometry = new THREE.SphereGeometry( 26, 100,100);
	var sphereMaterial = new THREE.MeshLambertMaterial({ map: new THREE.TextureLoader().load(
        '../textures/tierra_8k.jpg'
    )})
	tierraBola = new THREE.Mesh( sphereGeometry, sphereMaterial );
	tierraBola.receiveShadow = true;
	tierraBola.rotation.z=-Math.PI/2;
	scene.add( tierraBola ); //Agregamos la tierra a la escena
	tierraBola.position.set(tierraBola.position.x,-24,2) //Situamos la tierra
	addWorldgodzillas();
}
function addLight(){

	luzSol = new THREE.DirectionalLight( 0xC8C9AB, 0.9);
	luzSol.position.set( 12,6,-7 );
	luzSol.castShadow = true;
	scene.add(luzSol);
	//Propiedades de las sombras del sol
	luzSol.shadow.mapSize.width = 256;
	luzSol.shadow.mapSize.height = 256;
	luzSol.shadow.camera.near = 0.01;
	luzSol.shadow.camera.far = 20 ;

    var focal = new THREE.SpotLight('white', 0.05);
	//Propiedades sombras focal
    focal.position.set(0, 40, 10);
    focal.target.position.set(0, 0, 0);
    focal.angle = Math.PI / 7;
    focal.penumbra = 0.2;

    focal.shadow.camera.near = 0.011;
    focal.shadow.camera.far = 20;
    focal.shadow.camera.fov = 180;
    focal.shadow.mapSize.width = 256;
    focal.shadow.mapSize.height = 256;

    scene.add(focal.target);
    focal.castShadow = true;
    scene.add(focal);

	//No puede crear sombras, pero es realista para planetas
	var hemisphereLight = new THREE.HemisphereLight(0xfffafa,0x000000, 0.7) 
	scene.add(hemisphereLight);
}
function agregarGodzillaCamino(){
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
function addgodzilla(enCamino, row, isLeft){
	var newgodzilla;
	if(enCamino){
		if(godzillasPool.length==0)return;
		newgodzilla=godzillasPool.pop();
		newgodzilla.visible=true;
		godzillasCamino.push(newgodzilla);
		sphericalHelper.set( 25.7, caminoAngleValues[row], -tierraBola.rotation.x+4 );
	}else{
		newgodzilla=newGodzilla();
		var forestAreaAngle=0;//[1.52,1.57,1.62];
		if(isLeft){
			forestAreaAngle=1.8;
		}else{
			forestAreaAngle=1.4;
		}
		sphericalHelper.set( 25.7, forestAreaAngle, row );
	}
	newgodzilla.position.setFromSpherical( sphericalHelper );
	var rollingGroundVector=tierraBola.position.clone().normalize();
	var godzillaVector=newgodzilla.position.clone().normalize();
	newgodzilla.quaternion.setFromUnitVectors(godzillaVector,rollingGroundVector);
	newgodzilla.rotation.x+=(Math.random()*(2*Math.PI/10))+-Math.PI/10;
	
	tierraBola.add(newgodzilla);
}
function newGodzilla(){
	return SkeletonUtils.clone(godzilla);
}

function update(time,timeAnt){
	if(!haChocado){
		stats.update();
		var delta = reloj2.getDelta()
		tierraBola.rotation.x += velRuede * delta * 100;
		bolaProta.rotation.x -= velocidadRuedeBola * delta * 150;
		//El math.lerp interpola linealmente los valores según el valor de interpolación (tercer argumento)
		bolaProta.position.x=THREE.Math.lerp(bolaProta.position.x,currentLane, velCambioCamino*reloj.getDelta());

		if(!haChocado && enPartida){ //Se suma la puntuación
			score+=1000*velRuede*(1/godzillaReleaseInterval) * delta
			scoreText.innerHTML="Puntuación: " + Math.round(score).toString();
		}

		if(reloj.getElapsedTime()>godzillaReleaseInterval){ //Se actualiza la puntuación aquí para ser independiente de fps
			reloj.start();
			agregarGodzillaCamino();
		}
		calcularChoque();
		render();
		requestAnimationFrame(update);
	}
}
function calcularChoque(){
	var onegodzilla;
	var godzillaPos = new THREE.Vector3();
	var godzillasToRemove=[];
	godzillasCamino.forEach( function ( element, index ) {
		onegodzilla=godzillasCamino[ index ];
		godzillaPos.setFromMatrixPosition( onegodzilla.matrixWorld );
		if(godzillaPos.z>6 && onegodzilla.visible){//Se va del fov de la cámara
			godzillasToRemove.push(onegodzilla);
		}else{//Comprobar choque
			if(godzillaPos.distanceTo(bolaProta.position)<=0.6){ //Balancear en torno a distancia
				haChocado=true;
				gameOver();
			}
		}
	});
	var fromWhere;
	godzillasToRemove.forEach( function ( element, index ) {
		onegodzilla=godzillasToRemove[ index ];
		fromWhere=godzillasCamino.indexOf(onegodzilla);
		godzillasCamino.splice(fromWhere,1);
		godzillasPool.push(onegodzilla);
		onegodzilla.visible=false;
	});
}

function render(){
    renderer.render(scene, camera);
}

function gameOver () { //Fin de partida
	var audio = new Audio('../sounds/godScream.ogg');
	audio.volume = 0.5;
	audio.loop = true;
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

	scoreText.style.fontSize = "60px";
	scoreText.style.left = "40%";
	scoreText.style.top = "10%";

	document.body.append(botonEnd);
}

function updateAspectRatio() { //Se asegura que la cámara no se distorsione al modificar el aspect ratio
	sceneHeight = window.innerHeight;
	sceneWidth = window.innerWidth;
	renderer.setSize(sceneWidth, sceneHeight);
	camera.aspect = sceneWidth/sceneHeight;
	camera.updateProjectionMatrix();
}