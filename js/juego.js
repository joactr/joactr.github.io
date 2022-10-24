import {GLTFLoader} from '../lib/GLTFLoader.module.js'
import * as SkeletonUtils from '../lib/SkeletonUtils.js'
window.addEventListener('load', init, false);

var camera,scene,renderer,luzSol,img,tierraBola,bolaProta;
var velRuede=0.004,velocidadRuedeBola;
var sphericalHelper;
var caminoIzq=-1,caminoDer=1,caminoMid=0,currentLane,velCambioCamino = 7;
var reloj,reloj2; //Relojes para animación y control de tiempo
var escalaMonstruo = 0.0015; //El modelo es muy grande y hay que escalarlo
var intervaloCreacionGodzillas=0.35;
var godzillasCamino,godzillasPool;
var stats,scoreText,score,botonFacil,botonNormal,botonDificil, godzilla;
var haChocado, enPartida = false;

function menu(dificultad){ //Se ha apretado un botón de inicio, empezamos
	if(dificultad === "facil"){
		velRuede = 0.003;
		intervaloCreacionGodzillas=0.5;
	}else if(dificultad === "facil"){
		velRuede = 0.004;
		intervaloCreacionGodzillas=0.35;
	}else{
		velRuede = 0.006;
		intervaloCreacionGodzillas=0.28;
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
	audio.loop = true;
	haChocado=false;
	score=0;
	godzillasCamino=[];
	godzillasPool=[];
	reloj=new THREE.Clock(),reloj2=new THREE.Clock();
	reloj.start();
	velocidadRuedeBola=velRuede*26;
	sphericalHelper = new THREE.Spherical(); //Ayuda a plantear las coordenadas esféricas de un objeto con respecto a la tierra
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.01, 100 );
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xfffafa, 1); 
    renderer.shadowMap.enabled = true;//enable shadow
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild(renderer.domElement);
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
			agregarLuces();
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
	stats = new Stats();
	document.body.appendChild(stats.dom);
}

function newGodzillasPool(){
	var newGodzilla;
	for(var i=0; i<10;i++){ //10 es numero maximo de godzillas
		newGodzilla=crearGodzilla();
		godzillasPool.push(newGodzilla);
	}
}

function agregarBola(){ //Agregamos al protagonista a la escena
	var sphereGeometry = new THREE.SphereGeometry( 0.2, 80);
	var sphereMaterial = new THREE.MeshLambertMaterial({ map: new THREE.TextureLoader().load(
        '../textures/luna.jpg'
    )})
	bolaProta = new THREE.Mesh( sphereGeometry, sphereMaterial );
	bolaProta.receiveShadow = true;
	bolaProta.castShadow=true;
	scene.add( bolaProta );
	currentLane=caminoMid; 
	bolaProta.position.set(currentLane,2,4.8) //Inicializamos su posición
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
function agregarLuces(){
	scene.fog = new THREE.FogExp2( 0xf0fff0, 0.04 ); //No es una luz, pero es un efecto

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

	luzSol = new THREE.DirectionalLight( 0xc3c49f, 0.9);
	//Propiedades de las sombras del sol
	luzSol.shadow.mapSize.width = 256;
	luzSol.shadow.mapSize.height = 256;
	luzSol.shadow.camera.near = 0.01;
	luzSol.shadow.camera.far = 20 ;
	luzSol.position.set( 12,6,-7 );
	luzSol.castShadow = true;
	scene.add(luzSol);
}
function agregarGodzillaCamino(){
	var lineas=[0,1,2];
	var lane= Math.floor(Math.random()*3); //Elegimos entre una de las tres aleatoriamente
	addGodzilla(true,lane);
	lineas.splice(lane,1); //Nos aseguramos que no se puede volver a poner otro en ese camino
	if(Math.random()>0.5){ //Probabilidad de añadir un segundo monstruo al lado
		lane= Math.floor(Math.random()*2);
		addGodzilla(true,lineas[lane]);
	}
}
function addWorldgodzillas(){
	var numGodzillas=36;
	var gap=0.1744; //Distancias entre ellos
	for(var i=0;i<numGodzillas;i++){
		addGodzilla(false,i*gap, true);
		addGodzilla(false,i*gap, false);
	}
}
function addGodzilla(enCamino, fila, esIzq){
	var newGodzilla;
	if(enCamino){
		if(godzillasPool.length==0)return;
		newGodzilla=godzillasPool.pop();
		newGodzilla.visible=true;
		godzillasCamino.push(newGodzilla);
		var angulosModelos=[1.53,1.57,1.61]; //Ajusta la posición de spawn de los godzillas (der, mid, izq)
		//Se usa 25.7 de radio para que estén ligeramente enterrados y no tapen la vista
		sphericalHelper.set( 25.7, angulosModelos[fila], -tierraBola.rotation.x+4 ); //Radio, phi, theta
	}else{ //Es uno de los que está en los laterales
		newGodzilla=crearGodzilla();
		var anguloLateral=0; //Su ángulo va a depender de si está a la izquierda o derecha del protagonista
		if(esIzq){
			anguloLateral=1.75;
		}else{
			anguloLateral=1.4;
		}
		sphericalHelper.set( 25.7, anguloLateral, fila );
	}
	newGodzilla.position.setFromSpherical( sphericalHelper );
	var vecGiro=tierraBola.position.clone().normalize();
	var vecGodzilla=newGodzilla.position.clone().normalize();

	newGodzilla.quaternion.setFromUnitVectors(vecGodzilla,vecGiro);
	newGodzilla.rotation.x+=(Math.random()*(2*Math.PI/10))+-Math.PI/10;
	
	tierraBola.add(newGodzilla); //Agregamos el modelo al mapa
}
function crearGodzilla(){ //Devuelve un modelo clonado para meter en el mapa
	return SkeletonUtils.clone(godzilla);
}

function update(time,timeAnt){
	if(!haChocado){ //Solo actualizamos si seguimos jugando
		stats.update();
		var delta = reloj2.getDelta()
		tierraBola.rotation.x += velRuede * delta * 100;
		bolaProta.rotation.x -= velocidadRuedeBola * delta * 150;
		//El math.lerp interpola linealmente los valores según el valor de interpolación (tercer argumento)
		bolaProta.position.x=THREE.Math.lerp(bolaProta.position.x,currentLane, velCambioCamino*reloj.getDelta());

		if(!haChocado && enPartida){ //Se suma la puntuación
			score+=1000*velRuede*(1/intervaloCreacionGodzillas) * delta;
			scoreText.innerHTML="Puntuación: " + Math.round(score).toString();
		}
		//Agregamos nuevos enemigos si ha transcurrido el tiempo
		if(reloj.getElapsedTime()>intervaloCreacionGodzillas){ 
			reloj.start();
			agregarGodzillaCamino();
		}
		calcularChoque(); //Se encarga de calcular choques y visibilidad
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
	window.innerHeight = window.innerHeight;
	window.innerWidth = window.innerWidth;
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth/window.innerHeight;
	camera.updateProjectionMatrix();
}

function handleKeyDown(keyEvent){ //Atención a eventos de teclado
	if ( keyEvent.keyCode === 37) {//Flecha izquierda
		if(currentLane==caminoMid){
			currentLane=caminoIzq;
		}else if(currentLane==caminoDer){
			currentLane=caminoMid;
		}
	} else if ( keyEvent.keyCode === 39) {//Flecha derecha
		if(currentLane==caminoMid){
			currentLane=caminoDer;
		}else if(currentLane==caminoIzq){
			currentLane=caminoMid;
		}
	}
}