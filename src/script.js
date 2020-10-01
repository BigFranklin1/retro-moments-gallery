// ******************************************JSON Logic************************************************************
let pic_urls;
let pic_dir;
let pic_dir_single = [];
let pic_dirs = [];
let text_array = [];
let content = [];
let publish_time = [];
let materials_row = [];
let num = 0;
// let today = new Date().getMonth()+1+"-"+new Date().getDate();
let today = new Date().toISOString().slice(5, 10)

var dict = {};
console.log(today);
//********************************************

read();
async function read(){
  $.getJSON("test.json", function(json){
    // v
    $.each(json.users, function(i,vv){
      console.log(vv.user.nickname);
      $.each(vv.weibo,function(index,value){
        // console.log(parseInt(value.publish_time.substring(5,6)));
        // (5,7) refers to the month, month starts from 0
        // value
        if (parseInt(value.publish_time.substring(5,7),10) == new Date().getMonth()+1) {

          content.push(value.content);

          pic_urls = value.original_pictures.split(",");

          publish_time.push(value.publish_time);
          pic_dir_single = [];
          // load picture links
          console.log(pic_urls);
          if (pic_urls != "无") {
            if(pic_urls.length > 1){
              for(var i = 0; i < pic_urls.length; i++){
                pic_dir = "weibo/" + vv.user.id+"/img/"
                + value.publish_time.substring(0,4)
                + value.publish_time.substring(5,7)
                + value.publish_time.substring(8,10)
                + " _" + value.id + "_"+ (i+1) + ".jpg";
                // pic_dir.replace(/%20/g, " ");
                pic_dir_single.push(pic_dir);
              }
            }else{
              pic_dir = "weibo/" + vv.user.id+"/img/"
              + value.publish_time.substring(0,4)
              + value.publish_time.substring(5,7)
              + value.publish_time.substring(8,10)
              + " _" + value.id + ".jpg";
              // pic_dir.replace(/%20/g, " ");
              pic_dir_single.push(pic_dir);
            }
          }
          pic_dirs.push(pic_dir_single);
          console.log(pic_dirs);

          num++;
        }
      });

    });

    // change lines
    var incre = 12;
    let line = [];
    console.log(content);
    for (var i = 0; i < content.length; i++){
      line = [];
      for (var j = 0; j < content[i].length; j+=incre){
        line.push(content[i].substring(j,j+incre));
      }
      text_array.push(line);
    }
    // tweet.push(text_array);
    init();
  });
}



//***********************************************ThreeJS*****************************************************************

  // import * as THREE from './three.module.js';
  import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r119/build/three.module.js';

  import { PointerLockControls } from '/src/PointerLockControls.js';

  var camera, scene, renderer, controls, texture_content, texture_date;
  var canvas, canvas_date;
  var materials = [];
  var objects = [];
  var textures = [];
  var textures_date = [];
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


  function init() {


    console.log(num);
    console.log(publish_time);
    console.log(pic_dirs);
    // console.log(content);
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

    // ************************************************************************
    // position = boxGeometry.attributes.position;
    // colors = [];
    //
    // for ( var i = 0, l = position.count; i < l; i ++ ) {
    //   // color.setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
    //   colors.push( color.r, color.g, color.b );
    //
    // }
    const loadManager = new THREE.LoadingManager();
    const loader = new THREE.TextureLoader();
    // renderer
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    var ctx_dates_arr = [];
    console.log(publish_time);
    for (var i = 0; i < num; i++) {
      canvas = document.createElement('canvas');
      canvas.id = "canvas_content" + i.toString();
      canvas.width = "300";
      canvas.height = "300";

      canvas_date = document.createElement('canvas');
      canvas_date.id = "canvas_date" + i.toString();
      canvas_date.width = "300";
      canvas_date.height = "300";
      // canvas.style.display="none";
      blocker.appendChild(canvas);
      blocker.appendChild(canvas_date);

      // set content canvas
      var ctx_content = document.getElementById("canvas_content"+i.toString()).getContext('2d');
      ctx_content.font = '16pt Arial';
      ctx_content.fillStyle = 'red';
      ctx_content.fillRect(0, 0, canvas.width, canvas.height);
      ctx_content.fillStyle = 'white';
      ctx_content.fillRect(10, 10, canvas.width - 20, canvas.height - 20);
      ctx_content.fillStyle = 'black';
      ctx_content.textAlign = "left";
      ctx_content.textBaseline = "ideographic";

      //  text: j is the number of lines
      var kk = 0;
      for (var j = 0; j < 8; j++) {
        ctx_content.fillText(text_array[i].toString().substring(kk, kk+12), 20, 40+2.5*kk);
        kk+=12;
      }
      // console.log(text_array);
      // set date canvas
      var ctx_date = document.getElementById("canvas_date"+i.toString()).getContext('2d');
      ctx_date.font = '16pt Arial';
      ctx_date.fillStyle = 'red';
      ctx_date.fillRect(0, 0, canvas.width, canvas.height);
      ctx_date.fillStyle = 'white';
      ctx_date.fillRect(10, 10, canvas.width - 20, canvas.height - 20);
      ctx_date.fillStyle = 'black';
      ctx_date.textAlign = "left";
      ctx_date.textBaseline = "ideographic";
      ctx_date.fillText(publish_time[i], 20, 40+25);

      console.log(publish_time[i]);
      console.log(ctx_date);

      if (publish_time[i].substring(5,10) in dict) {
        console.log(dict[publish_time[i].substring(5,10)]);
        // for (var values in dict[publish_time[i].substring(5,10)]) {
        //   // ctx_dates_arr.push(values);
        //
        // }
        ctx_dates_arr = [];
        for (var b = 0; b < dict[publish_time[i].substring(5,10)].length; b++) {
          ctx_dates_arr[b] = dict[publish_time[i].substring(5,10)][b];
        }

        // for (var value in dict[publish_time[i].substring(5,10)]) {
        //   ctx_dates_arr.push(value);
        // }

        // ctx_dates_arr.push dict[publish_time[i].substring(5,10)];
        ctx_dates_arr.push(ctx_date);
        dict[publish_time[i].substring(5,10)] = ctx_dates_arr;
        ctx_dates_arr = [];
      }else{
        ctx_dates_arr = [];
        ctx_dates_arr.push(ctx_date);
        dict[publish_time[i].substring(5,10)] = ctx_dates_arr;

      }



      // content
      texture_content = new THREE.Texture(document.getElementById("canvas_content"+i.toString()));
      texture_content.needsUpdate = true;

      // date
      texture_date = new THREE.Texture(document.getElementById("canvas_date"+i.toString()));
      texture_date.needsUpdate = true;

      textures.push(texture_content);
      textures_date.push(texture_date);

      // Boxes
      var boxGeometry = new THREE.BoxBufferGeometry( 20, 20, 20 );
      boxGeometry = boxGeometry.toNonIndexed(); // ensure each face has unique vertices
      boxGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

      // *********************************materials***************************************
      materials_row = [];
      materials_row.push(new THREE.MeshBasicMaterial({map: textures[i]}));
      materials_row.push(new THREE.MeshBasicMaterial({map: textures_date[i]}));

      var bound;
      if (pic_dirs[i].length > 4) {
        bound = 4;
      }else{
        bound = pic_dirs[i].length;
      }
      for (var k = 0; k < bound; k++) {
        materials_row.push(new THREE.MeshBasicMaterial({map: loader.load(encodeURIComponent(pic_dirs[i][k].toString()))}));
      }
      if(pic_dirs[i].length < 4){
        for (var x = 0; x < 4 - pic_dirs[i].length; x++) {
          materials_row.push(new THREE.MeshBasicMaterial({map: textures_date[i]}));
        }
      }
      // console.log(materials_row);
      // materials.push([
      //   new THREE.MeshBasicMaterial({map: textures[i]}),
      //
      //   // for (var k = 0; k < pic_dirs[i].length; k++) {
      //   //   new THREE.MeshBasicMaterial({map: loader.load(encodeURIComponent(pic_dirs[i][k].toString()))});
      //   // }
      //   new THREE.MeshBasicMaterial({map: loader.load(encodeURIComponent(pic_dirs[i].toString()))}),
      //   // the curtail
      //   new THREE.MeshBasicMaterial({map: loader.load(encodeURIComponent(pic_dirs[i].toString()))}),
      //   new THREE.MeshBasicMaterial({map: textures_date[i]}),
      //   new THREE.MeshBasicMaterial({map: loader.load(encodeURIComponent(pic_dirs[i].toString()))}),
      //   new THREE.MeshBasicMaterial({map: loader.load(encodeURIComponent(pic_dirs[i].toString()))}),
      // ]);
      materials.push(materials_row);
      // console.log(materials);
      console.log(dict);
      var box = new THREE.Mesh(boxGeometry, materials[i]);
      // console.log(materials[i]);
      // var box = new THREE.Mesh( boxGeometry, boxMaterial );
      box.position.x = Math.floor( Math.random() * 20 - 10 ) * 20;
      box.position.y = Math.floor( Math.random() * 20 ) * 4 + 10;
      box.position.z = Math.floor( Math.random() * 20 - 10 ) * 20;

      box.rotation.y = Math.random()*20;

      scene.add( box );
      objects.push( box );
    }
    // console.log(pic_dirs);

    window.addEventListener( 'resize', onWindowResize, false );

    animate();

  }

  function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

  }

  function animate() {

    // objects.position.x += 1;
    requestAnimationFrame( animate );
    // texture_content.needsUpdate = true;

    if ( controls.isLocked === true ) {
      // animate boxes
      objects.forEach((obj, i) => {
        // console.log(dict);
        // console.log(today);
        // console.log(dict["10-04"].canvas.id);
        console.log(obj);
        // console.log(obj.material[1].map.image.id);
        for (var z = 0; z < dict["10-04"].length; z++) {
          if (obj.material[1].map.image.id == dict["10-04"][z].canvas.id) {
            console.log("YESYESYES");
            obj.position.x+=0.2;
            obj.position.z+=0.2;
          }
        }
        // if (obj.material[1].map.image.id==dict["10-04"].canvas.id) {
        //   console.log("YESYESYES");
        //   obj.position.x+=0.2;
        //   obj.position.z+=0.2;
        // }

      });
      // console.log(today.substring(0,2));
      console.log(objects);
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
