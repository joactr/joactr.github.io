import GUI from '../lib/lil-gui.module.min.js'; 
import {TWEEN} from '../lib/tween.module.min.js'; 

let renderer, scene, camera, cameraPlanta,matEsfera;
let controls,gui;
var material_robot,robot,suelo,base,esparrago,rotula,eje,mano,basePinzaDe,basePinzaIz,pinzaDe,pinzaIz,brazo,antebrazo;
var disco,nervio1,nervio2,nervio3,nervio4;
let L = 90;


function init(){
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(0x0000AA),1.0);
    renderer.autoClear=false;
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    
    var aspectRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(75,aspectRatio,0.1,5000);
    var cameraTop = new THREE.PerspectiveCamera(90,aspectRatio,0.1,1000);
    camera.position.set(80,250,80);
    setCameras(aspectRatio);
    window.addEventListener( 'resize', updateAspectRatio ); //Relacion de aspecto al cambiar tamaño de ventana
    window.addEventListener('keydown', moverRobot, false); //Usar flechas para mover robot
    controls = new THREE.OrbitControls( camera, renderer.domElement ); //Controles de la cámara con el raton
	controls.target.set(0, 150, 0);
    //Se limita el zoom
    controls.minDistance = 70;
    controls.maxDistance = 500;
    camera.lookAt(new THREE.Vector3(0, 150, 0)); //Hace que la cámara mire al punto
    cameraTop.lookAt(new THREE.Vector3(0, 0, 0)); //Hace que la cámara mire al origen de coordenadas


    //Iluminación
    var ambiental = new THREE.AmbientLight(0x878787);
    scene.add(ambiental);

    var directional = new THREE.DirectionalLight('white', 0.3);
    directional.position.set(0,1,1)
    directional.castShadow = true;
    scene.add(directional);
    directional.shadow.mapSize.width = 1000; // default
    directional.shadow.mapSize.height = 1000; // default
    directional.shadow.camera.near = 20; // default
    directional.shadow.camera.far = 1000; // default

    var puntual = new THREE.PointLight('white', 0.3);
    puntual.position.set(50,200,50)
    scene.add(puntual);
    puntual.castShadow = true

    var focal = new THREE.SpotLight('orange', 0.5);
    focal.position.set(300, 600, -800);
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

function updateAspectRatio() { //Por si cambia el tamaño de la ventana
    renderer.setSize( window.innerWidth, window.innerHeight );
    let ar = window.innerWidth / window.innerHeight;

    //Actualizar cámara perspectiva
    camera.aspect = ar;
    camera.updateProjectionMatrix();

    //Actualizar cámara ortográfica
    cameraPlanta.left = -L;
    cameraPlanta.right = L;
    cameraPlanta.top = L;
    cameraPlanta.bottom = -L;
    cameraPlanta.updateProjectionMatrix();
    
}

function update(time){
    TWEEN.update(time);
}

function setCameras(ar){ //Inicializa la cámara ortográfica de planta
    let cameraOrtografica;

    if(ar > 1){
        cameraOrtografica = new THREE.OrthographicCamera( -L,L,L,-L,-1000,500);
    }else{
        cameraOrtografica = new THREE.OrthographicCamera( -L,L,-L,L,-1000,500);
    }

    //planta
    cameraPlanta = cameraOrtografica.clone();
    cameraPlanta.position.set(0,L,0);
    cameraPlanta.lookAt(0,0,0);
    cameraPlanta.up = new THREE.Vector3(0,0,-1);
}

function loadScene(){
    material_robot = new THREE.MeshLambertMaterial({ wireframe: false }); //Creamos el material
    robot = new THREE.Object3D(); //Creamos el robot
    var baseG = new THREE.CylinderGeometry(50, 50, 15, 25); //RadioTop,RadioBot,altura,segmentosRad
    brazo = new THREE.Object3D();
    var ejeG = new THREE.CylinderGeometry(25, 25, 15, 20);
    var esparragoG = new THREE.BoxGeometry(18, 120, 12);
    var rotulaG = new THREE.SphereGeometry( 20, 10, 10 ); //Radio, segmentosAlto/Ancho
    antebrazo = new THREE.Object3D();
    var discoG = new THREE.CylinderGeometry(22, 22, 6, 20);
    var nervioG = new THREE.BoxGeometry(4, 80, 4);
    var manoG = new THREE.CylinderGeometry(15, 15, 40, 20);
    var pinzasG = new THREE.BufferGeometry();
    var basePinzaG = new THREE.BoxGeometry(19.9, 20, 4);

    const puntosPinza = [ //Cada vector indica un vértice de la pinza
        new THREE.Vector3(19, -10, -5), new THREE.Vector3(19, -8, 5),   new THREE.Vector3(19, -10, 5),

        new THREE.Vector3(19, -10, 5),  new THREE.Vector3(0, -6, 10),   new THREE.Vector3(0, -10, 10),

        new THREE.Vector3(19, -8, 5),   new THREE.Vector3(0, -6, 10),   new THREE.Vector3(19, -10, 5),

        new THREE.Vector3(19, -10, -5), new THREE.Vector3(0, -10, -10), new THREE.Vector3(0, -6, -10),

        new THREE.Vector3(19, -8, -5),  new THREE.Vector3(19, -10, -5), new THREE.Vector3(0, -6, -10),

        new THREE.Vector3(19, -8, -5),  new THREE.Vector3(19, -8, 5),   new THREE.Vector3(19, -10, -5),

        new THREE.Vector3(19, -8, 5),   new THREE.Vector3(0, -6, -10),  new THREE.Vector3(0, -6, 10),

        new THREE.Vector3(19, -8, -5),  new THREE.Vector3(0, -6, -10),  new THREE.Vector3(19, -8, 5),

        new THREE.Vector3(19, -10, 5),  new THREE.Vector3(0, -10, 10),  new THREE.Vector3(0, -10, -10),

        new THREE.Vector3(19, -10, -5), new THREE.Vector3(19, -10, 5),  new THREE.Vector3(0, -10, -10),
    ];

    var normals = new Float32Array( //Normales de cada vértice para cada cara de forma normalizada
        [
            1,0,0,  1,0,0,  1,0,0,

            0.9701425001453319,0.24253562503633297,0,   0.9701425001453319,0.24253562503633297,0,   0.9701425001453319,0.24253562503633297,0,

            0.9701425001453319,0.24253562503633297,0,   0.9701425001453319,0.24253562503633297,0,   0.9701425001453319,0.24253562503633297,0,

            0.9701425001453319,-0.24253562503633297,0,  0.9701425001453319,-0.24253562503633297,0,  0.9701425001453319,-0.24253562503633297,0,

            0.9701425001453319,-0.24253562503633297,0,  0.9701425001453319,-0.24253562503633297,0,  0.9701425001453319,-0.24253562503633297,0,

            1,0,0,  1,0,0,  1,0,0,

            0.10468478451804274, 0.994505452921406, 0,  0.10468478451804274, 0.994505452921406, 0,  0.10468478451804274, 0.994505452921406, 0,

            0.10468478451804274, 0.994505452921406, 0,  0.10468478451804274, 0.994505452921406, 0,  0.10468478451804274, 0.994505452921406, 0,

            0,1,0,  0,1,0,  0,1,0,
            
            0,1,0,  0,1,0,  0,1,0,
        ]
    );

    //Probé a definirlo mediante posiciones e índices pero no cogía las normales
    pinzasG.setFromPoints(puntosPinza)
    pinzasG.setAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );
    pinzasG.computeVertexNormals();
    
    //Las posiciones y rotaciones de las pinzas son distintas para que la parte externa de la pinza quede similar
    pinzaIz = new THREE.Mesh(pinzasG, material_robot);
    pinzaIz.position.set(0, 10, 8);
    pinzaIz.rotateY(-Math.PI / 2).rotateX(Math.PI).rotateZ(-Math.PI/2);
    pinzaIz.receiveShadow = true;
    pinzaIz.castShadow = true;

    pinzaDe = new THREE.Mesh(pinzasG, material_robot);
    pinzaDe.position.set(0, 10, -8);
    pinzaDe.rotateX(Math.PI / 2).rotateY(-Math.PI/2).rotateZ(-Math.PI);
    pinzaDe.receiveShadow = true;
    pinzaDe.castShadow = true;

    basePinzaIz = new THREE.Mesh(basePinzaG, material_robot);
    basePinzaIz.rotateX(Math.PI / 2);
    basePinzaIz.position.set(0,-8,10);
    basePinzaIz.receiveShadow = true;
    basePinzaIz.castShadow = true;

    basePinzaDe = new THREE.Mesh(basePinzaG, material_robot);
    basePinzaDe.rotateX(Math.PI / 2);
    basePinzaDe.position.set(0,8,10);
    basePinzaDe.receiveShadow = true;
    basePinzaDe.castShadow = true;

    suelo = new THREE.PlaneGeometry(1000, 1000, 50, 50); //Ancho, alto, cantidad de segmentos ancho/alto

    base = new THREE.Mesh(baseG, material_robot);
    base.position.set(0, 0, 0);
    base.receiveShadow = true;
    base.castShadow = true;

    eje = new THREE.Mesh(ejeG, material_robot);
    eje.rotateZ(Math.PI/2);
    eje.receiveShadow = true;
    eje.castShadow = true;

    esparrago = new THREE.Mesh(esparragoG, material_robot);
    esparrago.position.set(0,50,0);
    esparrago.rotateY(Math.PI / 2);
    esparrago.receiveShadow = true;
    esparrago.castShadow = true;

    var paredes = ["../textures/paredes/posx.jpg","../textures/paredes/negx.jpg","../textures/paredes/posy.jpg",
    "../textures/paredes/negy.jpg","../textures/paredes/posz.jpg","../textures/paredes/negz.jpg"];
    var texEsfera = new THREE.CubeTextureLoader().load(paredes);
    matEsfera = new THREE.MeshPhongMaterial({color:'gold',specular:'darkgray',sharpness:30,envMap:texEsfera})
    rotula = new THREE.Mesh(rotulaG, matEsfera);
    rotula.position.set(0, 120, 0);
    rotula.receiveShadow = true;
    rotula.castShadow = true;

    disco = new THREE.Mesh(discoG, material_robot);
    disco.position.set(0, 0, 0);
    disco.receiveShadow = true;
    disco.castShadow = true;

    nervio1 = new THREE.Mesh(nervioG, material_robot);
    nervio1.position.set(-8, 46, 8);
    nervio1.receiveShadow = true;
    nervio1.castShadow = true;
    nervio2 = new THREE.Mesh(nervioG, material_robot);
    nervio2.position.set(8, 46, 8);
    nervio2.receiveShadow = true;
    nervio2.castShadow = true;
    nervio3 = new THREE.Mesh(nervioG, material_robot);
    nervio3.position.set(-8, 46, -8);
    nervio3.receiveShadow = true;
    nervio3.castShadow = true;
    nervio4 = new THREE.Mesh(nervioG, material_robot);
    nervio4.position.set(8, 46, -8);
    nervio4.receiveShadow = true;
    nervio4.castShadow = true;

    antebrazo.position.set(0, 120, 0)
    mano = new THREE.Mesh(manoG, material_robot);
    mano.position.set(0, 80, 0);
    mano.rotateZ(Math.PI/2);
    mano.receiveShadow = true;
    mano.castShadow = true;

    //Creamos y agregamos el plano base
    var material = new THREE.MeshLambertMaterial({ color: 'white', map: new THREE.TextureLoader().load(
        "../textures/madera.jpg") });

    var plano = new THREE.Mesh(suelo, material);
    plano.rotateX(-Math.PI/2);
    plano.receiveShadow = true;
    scene.add(plano);
    scene.add(new THREE.AxesHelper(1000));

    //Completamos y agregamos el robot y sus partes a la escena mediante el grafo de escena
    
    basePinzaIz.add(pinzaIz);
    basePinzaDe.add(pinzaDe);
    mano.add(basePinzaIz);
    mano.add(basePinzaDe);
    antebrazo.add(disco);
    antebrazo.add(nervio1);
    antebrazo.add(nervio2);
    antebrazo.add(nervio3);
    antebrazo.add(nervio4);
    antebrazo.add(mano);
    brazo.add(antebrazo);
    brazo.add(rotula);
    brazo.add(eje);
    brazo.add(esparrago);
    base.add(brazo);
    robot.add(base);
    scene.add(robot);



    const paredesHab = []
    paredesHab.push( new THREE.MeshBasicMaterial({side: THREE.BackSide,
        map: new THREE.TextureLoader().load("../textures/paredes/posx.jpg")}))
    paredesHab.push( new THREE.MeshBasicMaterial({side: THREE.BackSide,
        map: new THREE.TextureLoader().load("../textures/paredes/negx.jpg")}))
    paredesHab.push( new THREE.MeshBasicMaterial({side: THREE.BackSide,
        map: new THREE.TextureLoader().load("../textures/paredes/posy.jpg")}))
    paredesHab.push( new THREE.MeshBasicMaterial({side: THREE.BackSide,
        map: new THREE.TextureLoader().load("../textures/paredes/negy.jpg")}))
    paredesHab.push( new THREE.MeshBasicMaterial({side: THREE.BackSide,
        map: new THREE.TextureLoader().load("../textures/paredes/posz.jpg")}))
    paredesHab.push( new THREE.MeshBasicMaterial({side: THREE.BackSide,
        map: new THREE.TextureLoader().load("../textures/paredes/negz.jpg")}))

    var habitacion = new THREE.Mesh(new THREE.BoxGeometry(5000, 5000, 5000), paredesHab);
    scene.add(habitacion);
}

function animate(){

}

function render(){
    requestAnimationFrame(render);
    update();
    

    renderer.clear(); //Borramos la pantalla
    
    //Agregamos el viewport general y su cámara
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight)
    renderer.render(scene, camera);
    //Agregamos el viewport y la cámara planta
    renderer.setViewport(0, window.innerHeight-Math.min(window.innerWidth, window.innerHeight) / 4, 
                        Math.min(window.innerWidth, window.innerHeight) / 4, Math.min(window.innerWidth, window.innerHeight) / 4)
    renderer.render(scene, cameraPlanta);
}

function crearInterfaz() {
    var aspectRatio = window.innerWidth / window.innerHeight;
    //Interfaz de usuario
    var effectControl = {
        giroBase: 0,
        giroBrazo: 0,
        giroAntebrazoY: 0,
        giroAntebrazoZ: 0,
        giroPinza: 0,
        separacionPinza: 6,
        alambres: false,

        animar: function () {

            const abrirPinzaIz = new TWEEN.Tween( basePinzaIz.position ).
                to( {y:-10}, 1000).interpolation( TWEEN.Interpolation.Bezier ).
                onUpdate(value => {this.separacionPinza = -value.y-2});
            const abrirPinzaDe = new TWEEN.Tween( basePinzaDe.position ).
                to( {y:10}, 1000).interpolation( TWEEN.Interpolation.Bezier ).
                onUpdate(value => {this.separacionPinza = value.y+2}).onStart(()=>abrirPinzaIz.start());

            const bajarBrazo = new TWEEN.Tween( brazo.rotation ).
                to( {x:Math.PI / 4}, 1000).interpolation( TWEEN.Interpolation.Bezier ).
                onUpdate(value => {this.giroBrazo = value.x * 180 / Math.PI;});

            const bajarAntebrazo = new TWEEN.Tween( antebrazo.rotation ).
                to( {x:Math.PI / 3}, 1000).interpolation( TWEEN.Interpolation.Bezier ).
                onUpdate(value => {this.giroAntebrazoZ = value.x * 180 / Math.PI;});

            const girarBase = new TWEEN.Tween( base.rotation ).
                to( {y:Math.PI / 2}, 1000).interpolation( TWEEN.Interpolation.Bezier ).
                onUpdate(value => {this.giroBase = value.y * 180 / Math.PI;});
            
            const subirAntebrazo = new TWEEN.Tween( antebrazo.rotation ).
                to( {x:0}, 1000).interpolation( TWEEN.Interpolation.Bezier ).
                onUpdate(value => {this.giroAntebrazoZ = value.x * 180 / Math.PI;}).onStart(()=>girarBase.start());

            const cerrarPinzaIz = new TWEEN.Tween( basePinzaIz.position ).
                to( {y:-2}, 1000).interpolation( TWEEN.Interpolation.Bezier ).
                onUpdate(value => {this.separacionPinza = -value.y});
            const cerrarPinzaDe = new TWEEN.Tween( basePinzaDe.position ).
                to( {y:2}, 1000).interpolation( TWEEN.Interpolation.Bezier ).
                onUpdate(value => {this.separacionPinza = value.y}).onStart(()=>cerrarPinzaIz.start());

            const girarAntebrazoY = new TWEEN.Tween( antebrazo.rotation ).
                to( {y:Math.PI}, 1000).interpolation( TWEEN.Interpolation.Bezier ).
                onUpdate(value => {this.giroAntebrazoY = value.y});

            const subirBrazo = new TWEEN.Tween( brazo.rotation ).
                to( {x:0}, 1000).interpolation( TWEEN.Interpolation.Bezier ).
                onUpdate(value => {this.giroBrazo = value.x * 180 / Math.PI;});


            
            abrirPinzaDe.chain(bajarBrazo);
            bajarBrazo.chain(bajarAntebrazo);
            bajarAntebrazo.chain(subirAntebrazo);
            subirAntebrazo.chain(cerrarPinzaDe);
            cerrarPinzaDe.chain(girarAntebrazoY);
            girarAntebrazoY.chain(subirBrazo);

            abrirPinzaDe.start();
        
        },
    }
    gui = new GUI();
    gui.title("Controles Robot")
    gui.add(effectControl, "giroBase", -180, 180, 1).name("Giro Base").onChange((value)=>{
        base.rotation.y = value * Math.PI / 180;
    }).listen();


    gui.add(effectControl, "giroBrazo", -45, 45, 1).name("Giro Brazo").onChange((value)=>{
        brazo.rotation.x = value * Math.PI / 180;
    }).listen();

    gui.add(effectControl, "giroAntebrazoY", -180, 180, 1).name("Giro Antebrazo Y").onChange((value)=>{
        antebrazo.rotation.y = value * Math.PI / 180;
    }).listen();

    gui.add(effectControl, "giroAntebrazoZ", -90, 90, 1).name("Giro Antebrazo Z").onChange((value)=>{
        antebrazo.rotation.x = value * Math.PI / 180;
    }).listen();

    gui.add(effectControl, "giroPinza", -40, 220, 1).name("Giro Pinza").onChange((value)=>{
        mano.rotation.x = -value * Math.PI / 180;
    }).listen();

    gui.add(effectControl, "separacionPinza", 0, 15, 1).name("Separación pinza").onChange((value)=>{
        basePinzaIz.position.y = -value-2;
        basePinzaDe.position.y = value+2;
    }).listen();

    gui.add(effectControl, "alambres").name("Alambres").onChange((value)=>{
        material_robot.wireframe = value;
        matEsfera.wireframe = value;
    }).listen();

    gui.add(effectControl, "animar").name("Animar").onChange((value)=>{
        console.log("Hola")
    }).listen();
}

function moverRobot(event) { //Mueve el robot con las flechas del teclado
    const keyName = event.key;
    switch (keyName) {
        case 'ArrowUp':
            new TWEEN.Tween( robot.position ).
            to( {z:robot.position.z-10}, 100).interpolation( TWEEN.Interpolation.Bezier ).
            onUpdate(value => {robot.position.z = value.z}).start();
            break;
        case 'ArrowDown':
            new TWEEN.Tween( robot.position ).
            to( {z:robot.position.z+10}, 100).interpolation( TWEEN.Interpolation.Bezier ).
            onUpdate(value => {robot.position.z = value.z}).start();
            break;
        case 'ArrowLeft':
            new TWEEN.Tween( robot.position ).
            to( {x:robot.position.x-10}, 100).interpolation( TWEEN.Interpolation.Bezier ).
            onUpdate(value => {robot.position.x = value.x}).start();
            break;
        case 'ArrowRight':
            new TWEEN.Tween( robot.position ).
            to( {x:robot.position.x+10}, 100).interpolation( TWEEN.Interpolation.Bezier ).
            onUpdate(value => {robot.position.x = value.x}).start();
            break;
    }
}

init();
loadScene();
crearInterfaz();
render();