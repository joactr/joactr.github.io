let renderer, scene, camera, cameraPlanta;
let controls;
let L = 90;


function init(){
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(0x0000AA),1.0);
    renderer.autoClear=false;
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();

    var aspectRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(75,aspectRatio,0.1,1000);
    cameraTop = new THREE.PerspectiveCamera(90,aspectRatio,0.1,1000);
    camera.position.set(80,250,80);
    setCameras(aspectRatio);
    window.addEventListener( 'resize', updateAspectRatio );
    controls = new THREE.OrbitControls( camera, renderer.domElement ); //Controles de la cámara con el raton
	controls.target.set(0, 150, 0);
    //Se limita el zoom
    controls.minDistance = 50;
    controls.maxDistance = 500;
    camera.lookAt(new THREE.Vector3(0, 150, 0)); //Hace que la cámara mire al punto
    cameraTop.lookAt(new THREE.Vector3(0, 0, 0)); //Hace que la cámara mire al origen de coordenadas

}

function updateAspectRatio() { //Por si cambia el tamaño de la ventana
    renderer.setSize( window.innerWidth, window.innerHeight );
    let ar = window.innerWidth / window.innerHeight;

    //Actualizar cámara perspectiva
    camera.aspect = ar;
    camera.updateProjectionMatrix();

    //Actualizar cámara ortográfica
    if (aspectRatio > 1) {
        cameraPlanta.left = -L*ar
        cameraPlanta.right = L*ar
        cameraPlanta.top = L;
        cameraPlanta.bottom = -L
    } else {
        cameraPlanta.left = -L
        cameraPlanta.right = L
        cameraPlanta.top = L/ar;
        cameraPlanta.bottom = -L/ar
    }
    cameraPlanta.updateProjectionMatrix();
    
}

function update(){

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
    var material = new THREE.MeshBasicMaterial({ color: 'red', wireframe: true }); //Creamos el material
    var robot = new THREE.Object3D(); //Creamos el robot
    var baseG = new THREE.CylinderGeometry(50, 50, 15, 25); //RadioTop,RadioBot,altura,segmentosRad
    var brazo = new THREE.Object3D();
    var ejeG = new THREE.CylinderGeometry(25, 25, 15, 20);
    var esparragoG = new THREE.BoxGeometry(18, 120, 12);
    var rotulaG = new THREE.SphereGeometry( 20, 10, 10 ); //Radio, segmentosAlto/Ancho
    var antebrazo = new THREE.Object3D();
    var discoG = new THREE.CylinderGeometry(22, 22, 6, 20);
    var nervioG = new THREE.BoxGeometry(4, 80, 4);
    var manoG = new THREE.CylinderGeometry(15, 15, 40, 20);
    var pinzasG = new THREE.BufferGeometry();
    const pinzaPosition = new Float32Array([ //Posiciones de cada uno de los vértices de las geometría de cada pinza
        -18,0,0,//0
        0,0,0,//1
        18,4,0,//2
        18,16,0,//3
        0,20,0,//4  
        -18,20,0,//5
        -18,20,-4,//6
        0,20,-4,//7   
        18,16,-2,//8
        18,4,-2,//9    
        0,0,-4,//10   
        -18,0,-4//11
    ]);
    
    const pinzaIndices = [
        1,2,3,    3,4,1,    2,9,8, 
        8,3,2,    7,8,9,    9,10,7, 
        7,4,1,    6,7,10,   10,11,6, 
        6,11,0,   0,5,6,    7,6,5,
        8,7,4,    4,3,8,    2,1,10, 
        0,1,4,    4,5,0,    1,10,7, 
        5,4,7,    0,1,10,   10,11,0,
        10,9,2,   11,10,1,   11,1,0
    ]

    pinzasG.setIndex(pinzaIndices)
    pinzasG.setAttribute( 'position', new THREE.Float32BufferAttribute( pinzaPosition, 3 ) );
    pinzasG.computeVertexNormals();
    
    //Las posiciones y rotaciones de las pinzas son distintas para que la parte externa de la pinza quede similar
    var pinzaIz = new THREE.Mesh(pinzasG, material);
    pinzaIz.position.set(-10, -6, 15);
    pinzaIz.rotateX(-Math.PI / 2).rotateZ(-Math.PI / 2)

    var pinzaDe = new THREE.Mesh(pinzasG, material);
    pinzaDe.position.set(10, 6, 15);
    pinzaDe.rotateX(Math.PI / 2).rotateZ(Math.PI / 2);

    var suelo = new THREE.PlaneGeometry(1000, 1000, 50, 50); //Ancho, alto, cantidad de segmentos ancho/alto

    var base = new THREE.Mesh(baseG, material);
    base.position.set(0, 0, 0);

    var eje = new THREE.Mesh(ejeG, material);
    eje.rotateZ(Math.PI/2);

    var esparrago = new THREE.Mesh(esparragoG, material);
    esparrago.position.set(0,50,0);
    esparrago.rotateY(Math.PI / 2);

    var rotula = new THREE.Mesh(rotulaG, material);
    rotula.position.set(0, 120, 0);

    var disco = new THREE.Mesh(discoG, material);
    disco.position.set(0, 120, 0);

    var nervio1 = new THREE.Mesh(nervioG, material);
    nervio1.position.set(-8, 166, 8);
    var nervio2 = new THREE.Mesh(nervioG, material);
    nervio2.position.set(8, 166, 8);
    var nervio3 = new THREE.Mesh(nervioG, material);
    nervio3.position.set(-8, 166, -8);
    var nervio4 = new THREE.Mesh(nervioG, material);
    nervio4.position.set(8, 166, -8);

    var mano = new THREE.Mesh(manoG, material);
    mano.position.set(0, 206, 0);
    mano.rotateZ(Math.PI/2);

    //Creamos y agregamos el plano base
    material = new THREE.MeshBasicMaterial({ color: 'green', wireframe: true }); //Creamos el material
    var plano = new THREE.Mesh(suelo, material);
    plano.rotateX(-Math.PI/2);
    scene.add(plano);
    scene.add(new THREE.AxesHelper(1000));

    //Completamos y agregamos el robot y sus partes a la escena mediante el grafo de escena
    mano.add(pinzaIz);
    mano.add(pinzaDe);
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
    renderer.setViewport(0, window.innerHeight*(3/4), Math.min(window.innerWidth, window.innerHeight) / 4, Math.min(window.innerWidth, window.innerHeight) / 4)
    renderer.render(scene, cameraPlanta);
}

/*document.onkeydown = function(e) {
    switch (e.keyCode) {
        case 37:
            cameraX -= 1.5;
        break;
        case 38:
            cameraZ -= 1.5;
        break;
        case 39:
            cameraX += 1.5;
        break;
        case 40:
            cameraZ += 1.5;
        break;
        
    }
};*/

init();
loadScene();
render();