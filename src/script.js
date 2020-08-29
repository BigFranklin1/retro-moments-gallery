// response.setHeader('Access-Control-Allow-Origin','http://localhost:4000');
jQuery.ajaxPrefilter(function(options) {
    if (options.crossDomain && jQuery.support.cors) {
        options.url = 'https://cors-anywhere.herokuapp.com/' + options.url;
    }
});
// ******************************************JSON Logic************************************************************
let pic_urls;
// const content;
let text_array = [];
read();
function read(){
  $.getJSON("test.json", function(json){
    $.each(json.weibo,function(index,value){
      if (value.publish_time == "2020-03-07 06:14") {
        let content = value.content;
        var incre = 10;
        for (var i = 0; i < value.content.length; i+=incre){
          let sub = content.substring(i,i+incre);
          text_array.push(sub);
        }
        pic_urls = value.original_pictures.split(",");
        pic_urls.forEach((pic_url, i) => {
        	// console.log(pic_url);
        });
      }
    });
    // console.log(text_array);
    render();
     // output is desired:["#LV春夏21男装秀", "# @路易威登  玩", "的很开心的一天～ 路", "易威登的微博直播 [", "组图共6张]原图"]
  });
}
function render(){
  console.log(text_array);
  console.log(pic_urls);
}


//***********************************************ThreeJS*****************************************************************

  // import * as THREE from './three.module.js';
  import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r119/build/three.module.js';

  import { PointerLockControls } from '/PointerLockControls.js';

  var camera, scene, renderer, controls, texture;

  var objects = [];

  var raycaster;

  var moveForward = false;
  var moveBackward = false;
  var moveLeft = false;
  var moveRight = false;
  var canJump = false;

  var prevTime = performance.now();
  var velocity = new THREE.Vector3();
  var direction = new THREE.Vector3();
  var vertex = new THREE.Vector3();
  var color = new THREE.Color();

  var canvas = document.getElementById('canvas'),
      ctx = canvas.getContext('2d');
  init();
  animate();

  function init() {

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.y = 10;

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );
    scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

    var light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
    light.position.set( 0.5, 1, 0.75 );
    scene.add( light );

    controls = new PointerLockControls( camera, document.body );

    var blocker = document.getElementById( 'blocker' );
    var instructions = document.getElementById( 'instructions' );

    instructions.addEventListener( 'click', function () {

      controls.lock();

    }, false );

    controls.addEventListener( 'lock', function () {

      instructions.style.display = 'none';
      blocker.style.display = 'none';

    } );

    controls.addEventListener( 'unlock', function () {

      blocker.style.display = 'block';
      instructions.style.display = '';

    } );

    scene.add( controls.getObject() );

    var onKeyDown = function ( event ) {

      switch ( event.keyCode ) {

        case 38: // up
        case 87: // w
          moveForward = true;
          break;

        case 37: // left
        case 65: // a
          moveLeft = true;
          break;

        case 40: // down
        case 83: // s
          moveBackward = true;
          break;

        case 39: // right
        case 68: // d
          moveRight = true;
          break;

        case 32: // space
          if ( canJump === true ) velocity.y += 350;
          canJump = false;
          break;

      }

    };

    var onKeyUp = function ( event ) {

      switch ( event.keyCode ) {

        case 38: // up
        case 87: // w
          moveForward = false;
          break;

        case 37: // left
        case 65: // a
          moveLeft = false;
          break;

        case 40: // down
        case 83: // s
          moveBackward = false;
          break;

        case 39: // right
        case 68: // d
          moveRight = false;
          break;

      }

    };

    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );

    raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

    // floor

    var floorGeometry = new THREE.PlaneBufferGeometry( 2000, 2000, 100, 100 );
    floorGeometry.rotateX( - Math.PI / 2 );

    // vertex displacement

    var position = floorGeometry.attributes.position;

    // for ( var i = 0, l = position.count; i < l; i ++ ) {
    //
    // 	vertex.fromBufferAttribute( position, i );
    //
    // 	vertex.x += Math.random() * 5 - 10;
    // 	vertex.y += Math.random() * 2;
    // 	vertex.z += Math.random() * 5 - 10;
    //
    // 	position.setXYZ( i, vertex.x, vertex.y, vertex.z );
    //
    // }

    floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices

    position = floorGeometry.attributes.position;
    var colors = [];

    for ( var i = 0, l = position.count; i < l; i ++ ) {

      color.setHSL( Math.random() * 0.2 + 0.46, 0.25, Math.random() * 0.1 + 0.45 );
      colors.push( color.r, color.g, color.b );

    }

    floorGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

    var floorMaterial = new THREE.MeshBasicMaterial( { vertexColors: true } );

    var floor = new THREE.Mesh( floorGeometry, floorMaterial );
    scene.add( floor );

   // texture
    // let texture = new THREE.TextTexture({
    //   fillStyle: '#24ff00',
    //   fontFamily: '"Times New Roman", Times, serif',
    //   fontSize: 32,
    //   fontStyle: 'italic',
    //   text: [
    //     'Twinkle, twinkle, little star,',
    //     'How I wonder what you are!',
    //     'Up above the world so high,',
    //     'Like a diamond in the sky.',
    //   ].join('\n'),
    // });
    // Boxes
    var boxGeometry = new THREE.BoxBufferGeometry( 20, 20, 20 );
    boxGeometry = boxGeometry.toNonIndexed(); // ensure each face has unique vertices
    // ************************************************************************
    texture = new THREE.Texture(canvas);

    const loadManager = new THREE.LoadingManager();
    const loader = new THREE.TextureLoader();
    var img = new Image();
    img.crossOrigin = "anonymous";
    img.src="https://ww1.sinaimg.cn/large/63885668ly1ghhg0kjbe7j23dw52u4qr.jpg"
    const materials = [
      new THREE.MeshBasicMaterial({map: loader.load('img/20180101 _FCkPEfDDz_2.jpg')}),
      new THREE.MeshBasicMaterial({map: texture}),
      // the curtail
      new THREE.MeshBasicMaterial({map: texture}),
      new THREE.MeshBasicMaterial({map: loader.load('img/20180101 _FCkPEfDDz_1.jpg')}),
      new THREE.MeshBasicMaterial({map: loader.load(img)}),
      new THREE.MeshBasicMaterial({map: loader.load('https://threejsfundamentals.org/threejs/resources/images/flower-6.jpg')}),
    ];
    // ************************************************************************
    position = boxGeometry.attributes.position;
    colors = [];

    for ( var i = 0, l = position.count; i < l; i ++ ) {
      // color.setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
      colors.push( color.r, color.g, color.b );

    }

    boxGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

    for ( var i = 0; i < 10; i ++ ) {

      var boxMaterial = new THREE.MeshPhongMaterial( { specular: 0xffffff, flatShading: true, vertexColors: true } );
      boxMaterial.color.setHSL( Math.random() * 0.5 + 0.2, 0.35, Math.random() * 0.45 + 0.25 );

      var box = new THREE.Mesh(boxGeometry, materials);

      // var box = new THREE.Mesh( boxGeometry, boxMaterial );
      box.position.x = Math.floor( Math.random() * 20 - 10 ) * 20;
      box.position.y = Math.floor( Math.random() * 20 ) * 4 + 10;
      box.position.z = Math.floor( Math.random() * 20 - 10 ) * 20;

      box.rotation.y = Math.random()*20;

      scene.add( box );
      objects.push( box );

    }
    changeCanvas();

    // canvas.width = canvas.height = 0;

    //

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );

  }

  function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

  }

  function animate() {

    // objects.position.x += 1;
    requestAnimationFrame( animate );
    // changeCanvas();
    texture.needsUpdate = true;

    if ( controls.isLocked === true ) {
      // animate boxes
      objects.forEach((obj, i) => {
        obj.position.x+=0.1;
        obj.position.z+=0.1;
      });

      //
      raycaster.ray.origin.copy( controls.getObject().position );
      raycaster.ray.origin.y -= 10;

      var intersections = raycaster.intersectObjects( objects );

      var onObject = intersections.length > 0;

      var time = performance.now();
      var delta = ( time - prevTime ) / 1000;

      velocity.x -= velocity.x * 5.0 * delta;
      velocity.z -= velocity.z * 5.0 * delta;

      velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

      direction.z = Number( moveForward ) - Number( moveBackward );
      direction.x = Number( moveRight ) - Number( moveLeft );
      direction.normalize(); // this ensures consistent movements in all directions

      if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
      if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;

      if ( onObject === true ) {

        velocity.y = Math.max( 0, velocity.y );
        canJump = true;

      }

      controls.moveRight( - velocity.x * delta );
      controls.moveForward( - velocity.z * delta );

      controls.getObject().position.y += ( velocity.y * delta ); // new behavior

      if ( controls.getObject().position.y < 10 ) {

        velocity.y = 0;
        controls.getObject().position.y = 10;

        canJump = true;

      }

      prevTime = time;

    }

    renderer.render( scene, camera );

  }

  function changeCanvas() {
      ctx.font = '18pt Arial';
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'white';
      ctx.fillRect(10, 10, canvas.width - 20, canvas.height - 20);
      ctx.fillStyle = 'black';
      ctx.textAlign = "left";
      ctx.textBaseline = "ideographic";
      // ctx.fillText(new Date().getTime(), canvas.width / 2, canvas.height / 2);
      // console.log(typeof content);
      let text=["#LV春夏21男装秀", "# @路易威登  玩", "的很开心的一天～ 路", "易威登的微博直播 [", "组图共6张]原图"];
      // var text = content.split(" ", 3);
      // console.log(typeof content);
      // console.log(text.width);
      ctx.fillText(text[0], 10, 40);
      ctx.fillText(text[1], 10, 60);
      ctx.fillText(text[2], 10, 80);
  }