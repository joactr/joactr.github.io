var renderer, scene, camera, cameraX, cameraY, cameraZ;
var controls;




function init(){
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(0x0000AA),1.0);
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();

    var aspectRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(75,aspectRatio,0.1,1000);
    cameraX = 80;
    cameraY = 250;
    cameraZ = 80;
    camera.position.set(cameraX,cameraY,cameraZ);
    window.addEventListener( 'resize', onWindowResize );
    controls = new THREE.OrbitControls( camera, renderer.domElement ); //Controles de la cámara con el raton
	controls.target.set(0, 150, 0);
    camera.lookAt(new THREE.Vector3(0, 150, 0)); //Hace que la cámara mire al origen de coordenadas
}

function onWindowResize() { //Por si cambia el tamaño de la ventana
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function update(){

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
    var basePinzaG = new THREE.BoxGeometry(20, 19, 4);

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

    normals = new Float32Array( //Normales de cada vértice para cada cara de forma normalizada
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
    var pinzaIz = new THREE.Mesh(pinzasG, material);
    pinzaIz.position.set(0, -16, 19.5);
    pinzaIz.rotateY(-Math.PI / 2).rotateX(Math.PI);

    var pinzaDe = new THREE.Mesh(pinzasG, material);
    pinzaDe.position.set(0, 16, 19.5);
    pinzaDe.rotateY(Math.PI / 2).rotateX(Math.PI).rotateZ(-Math.PI);

    var basePinzaIz = new THREE.Mesh(basePinzaG, material);
    basePinzaIz.rotateX(Math.PI / 2);
    basePinzaIz.position.set(0,-8,10);

    var basePinzaDe = new THREE.Mesh(basePinzaG, material);
    basePinzaDe.rotateX(Math.PI / 2);
    basePinzaDe.position.set(0,8,10);

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
}

function render(){
    requestAnimationFrame(render);
    update();
    renderer.render(scene, camera);
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