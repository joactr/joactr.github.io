import {TWEEN} from '../lib/tween.module.min.js'; 
import * as CANNON from '../lib/cannon-es.js';
import {GLTFLoader} from '../lib/GLTFLoader.module.js';
import { threeToCannon, ShapeType } from '../lib/three-to-cannon.modern.js';
import CannonDebugger from '../lib/cannon-es-debugger.js'


let renderer, scene, camera,materialPlano,materialProta;
let mapa,world,planoBase,sphereBody, protagonista, mapaBody, cannonDebugger;
let flechaArriba,flechaAbajo,flechaIzquierda,flechaDerecha;
let cameraOffset = new THREE.Vector3(80,80,80)
let timeAnt = 0;


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
    window.addEventListener('resize', updateAspectRatio ); //Relacion de aspecto al cambiar tamaño de ventana
    window.addEventListener('keydown', movermapa, false); //Usar flechas para mover mapa
    window.addEventListener('keyup', soltarTecla, false); //Usar flechas para mover mapa
    camera.lookAt(new THREE.Vector3(0, 0, 0)); //Hace que la cámara mire al punto
    cameraTop.lookAt(new THREE.Vector3(0, 0, 0)); //Hace que la cámara mire al origen de coordenadas
    world = new CANNON.World({
        gravity: new CANNON.Vec3(0, -300.82, 0), // m/s²
      })

    cannonDebugger = new CannonDebugger(scene, world, {})
}

function updateAspectRatio() { //Por si cambia el tamaño de la ventana
    renderer.setSize( window.innerWidth, window.innerHeight );
    let ar = window.innerWidth / window.innerHeight;

    //Actualizar cámara perspectiva
    camera.aspect = ar;
    camera.updateProjectionMatrix();
}

function loadScene(){



    const textureloader = new THREE.TextureLoader();
    textureloader.load('../images/space.jpeg' , function(texture)
            {
             scene.background = texture;  
            });
    materialPlano = new THREE.MeshStandardMaterial({ wireframe: false }); //Creamos el material
    materialProta = new THREE.MeshBasicMaterial({map: textureloader.load(
        '../textures/texturaProta.jpeg'
    )})
    const loader = new GLTFLoader();
    mapaBody = new CANNON.Body({
        type: CANNON.Body.STATIC
    })

    loader.load( 'models/mapa1.glb', function ( object ) {
            
            object.scene.position.set(0,10,0);
            object.scene.rotation.set(0,Math.PI/2,0)
            object.scene.scale.set(10,10,10)
            mapa.add( object.scene );
            const result = threeToCannon(object.scene);
            const {shape, offset, quaternion} = result;
            mapaBody.addShape(shape, offset, quaternion)
            mapaBody.position.set(0,10,0)
            world.addBody(mapaBody)
        }, ()=>{}, ()=>{} );

    
    mapa = new THREE.Object3D();
    var planoBaseG = new THREE.BoxGeometry(120, 12, 120);
    planoBase = new THREE.Mesh(planoBaseG, materialPlano);



    var protagonistaG = new THREE.SphereGeometry( 5, 10, 10 );
    protagonista = new THREE.Mesh(protagonistaG, materialProta);

    sphereBody = new CANNON.Body({
        mass: 1, // kg
        shape: new CANNON.Sphere(5),
    })
    sphereBody.linearDamping = 0.31;
    sphereBody.position.set(0,50,0);

    /*mapaBody = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Box(new CANNON.Vec3(60, 12, 60)),
    })
    mapaBody.position.set(0,-6,0);*/

    scene.add(protagonista);
    mapa.add(planoBase);
    scene.add(mapa);
    world.addBody(sphereBody);
    //world.addBody(mapaBody);
    
    const light = new THREE.AmbientLight( 0x909090 ); // soft white light
    scene.add( light );
    const dl = new THREE.DirectionalLight(0xff0000,0.5)
    dl.position.set(0,20,0)
    scene.add(dl)
}

function animate(time,timeAnt){
    var valorGiro = 0.008 * (time-timeAnt)/10
    var valorGiroRetorno = 0.006 * (time-timeAnt)/10
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

    if(sphereBody.position.y < -600){
        sphereBody.position.copy(new THREE.Vector3(0,12,0))
        sphereBody.velocity.copy(new THREE.Vector3(0,0,0))
        sphereBody.angularVelocity.copy(new THREE.Vector3(0,0,0))
    }

    world.fixedStep(1/60)
    cannonDebugger.update()
    TWEEN.update(time);
}

function render(time){
    
    requestAnimationFrame(render);
    animate(time,timeAnt);
    timeAnt = time


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
