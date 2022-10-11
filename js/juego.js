import GUI from '../lib/lil-gui.module.min.js'; 
import {TWEEN} from '../lib/tween.module.min.js'; 
import * as CANNON from '../lib/cannon-es.js';

let renderer, scene, camera,materialPlano;
let mapa,world,planoBase,sphereBody, protagonista, mapaBody;
let flechaArriba,flechaAbajo,flechaIzquierda,flechaDerecha;
let cameraOffset = new THREE.Vector3(80,80,80)


function init(){
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(0x0000AA),1.0);
    renderer.autoClear=false;
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    
    var aspectRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(75,aspectRatio,0.1,1000);
    var cameraTop = new THREE.PerspectiveCamera(90,aspectRatio,0.1,1000);
    camera.position.set(80,80,80);
    window.addEventListener( 'resize', updateAspectRatio ); //Relacion de aspecto al cambiar tamaño de ventana
    window.addEventListener('keydown', movermapa, false); //Usar flechas para mover mapa
    window.addEventListener('keyup', soltarTecla, false); //Usar flechas para mover mapa
    camera.lookAt(new THREE.Vector3(0, 0, 0)); //Hace que la cámara mire al punto
    cameraTop.lookAt(new THREE.Vector3(0, 0, 0)); //Hace que la cámara mire al origen de coordenadas
    world = new CANNON.World({
        gravity: new CANNON.Vec3(0, -300.82, 0), // m/s²
      })
}

function updateAspectRatio() { //Por si cambia el tamaño de la ventana
    renderer.setSize( window.innerWidth, window.innerHeight );
    let ar = window.innerWidth / window.innerHeight;

    //Actualizar cámara perspectiva
    camera.aspect = ar;
    camera.updateProjectionMatrix();
}

function loadScene(){
    materialPlano = new THREE.MeshNormalMaterial({ wireframe: true }); //Creamos el material
    mapa = new THREE.Object3D();
    var planoBaseG = new THREE.BoxGeometry(120, 12, 120);
    planoBase = new THREE.Mesh(planoBaseG, materialPlano);

    var planoBase2 = new THREE.Mesh(planoBaseG, materialPlano);
    planoBase2.position.set(-100,0,-100)

    var protagonistaG = new THREE.SphereGeometry( 5, 10, 10 );
    protagonista = new THREE.Mesh(protagonistaG, materialPlano);

    sphereBody = new CANNON.Body({
        mass: 1, // kg
        shape: new CANNON.Sphere(5),
    })
    sphereBody.linearDamping = 0.31;
    sphereBody.position.set(0,16,0);

    mapaBody = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Box(new CANNON.Vec3(60, 12, 60)),
    })
    mapaBody.position.set(0,-6,0);

    scene.add(protagonista);
    mapa.add(planoBase2);
    mapa.add(planoBase);
    scene.add(mapa);
    world.addBody(sphereBody);
    world.addBody(mapaBody);
    

}

function animate(time){
    var valorGiro = 0.018
    var valorGiroRetorno = 0.015
    if(flechaArriba && mapa.rotation.x > -0.785398){
        mapa.rotateOnWorldAxis(new THREE.Vector3(1,0,0), -valorGiro )
    }
    if(flechaAbajo && mapa.rotation.x < 0.785398){
        mapa.rotateOnWorldAxis(new THREE.Vector3(1,0,0), valorGiro )
    }
    if(flechaIzquierda && mapa.rotation.z < 0.785398){
        mapa.rotateOnAxis(new THREE.Vector3(0,0,1), valorGiro )
    }
    if(flechaDerecha && mapa.rotation.z > -0.785398){
        mapa.rotateOnAxis(new THREE.Vector3(0,0,1), -valorGiro )
    }
    if((mapa.rotation.x > valorGiroRetorno || mapa.rotation.x < -valorGiroRetorno)  && !flechaArriba && !flechaAbajo){
        mapa.rotateOnWorldAxis(new THREE.Vector3(1,0,0), -Math.sign(mapa.rotation.x)*valorGiroRetorno )
    }
    if((mapa.rotation.z > valorGiroRetorno || mapa.rotation.z < -valorGiroRetorno)  && !flechaIzquierda && !flechaDerecha){
        mapa.rotateOnAxis(new THREE.Vector3(0,0,1), -Math.sign(mapa.rotation.z)*valorGiroRetorno )
    }
    // Run the simulation independently of framerate every 1 / 60 ms
    protagonista.quaternion.copy(sphereBody.quaternion)
    protagonista.position.copy(sphereBody.position)
    mapaBody.quaternion.setFromEuler(mapa.rotation.x,0,mapa.rotation.z);
    camera.position.copy(sphereBody.position).add(cameraOffset); //Cámara sigue a la bola
    camera.lookAt = sphereBody.position //Cámara mira a la bola
    world.fixedStep()
    TWEEN.update(time);
}

function render(){
    requestAnimationFrame(render);
    animate();

    renderer.clear(); //Borramos la pantalla
    
    //Agregamos el viewport general y su cámara
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight)
    renderer.render(scene, camera);
}

function movermapa(event) { //Mueve el mapa con las flechas del teclado
    const keyName = event.key;
    switch (keyName) {
        case 'ArrowUp':
            flechaArriba = true;
            break;
        case 'ArrowDown':
            flechaAbajo = true;
            break;
        case 'ArrowLeft':
            flechaIzquierda = true;
            break;
        case 'ArrowRight':
            flechaDerecha = true;
        break;
    }
}

function soltarTecla(event){
    const keyName = event.key;
    switch (keyName) {
        case 'ArrowUp':
            flechaArriba = false;
            break;
        case 'ArrowDown':
            flechaAbajo = false;
            break;
        case 'ArrowLeft':
            flechaIzquierda = false;
            break;
        case 'ArrowRight':
            flechaDerecha = false;
        break;
    }

}

init();
loadScene();
render();
