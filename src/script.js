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
document.querySelector(".init_btn").onclick = function(){
  document.querySelector(".init_scene").classList.add("preload-finish");
  read();

}

// read();
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
  var cube;

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

    var colors = [];

    scene.add( new THREE.GridHelper( 2000, 100 ) );

    const loadManager = new THREE.LoadingManager();
    const loader = new THREE.TextureLoader(loadManager);
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
      ctx_content.fillStyle = 'black';
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
      ctx_date.fillStyle = 'black';
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
        ctx_dates_arr = [];
        for (var b = 0; b < dict[publish_time[i].substring(5,10)].length; b++) {
          ctx_dates_arr[b] = dict[publish_time[i].substring(5,10)][b];
        }
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

      materials.push(materials_row);

      var box = new THREE.Mesh(boxGeometry, materials[i]);

      scene.add( box );
      objects.push( box );

      // loader manager and UI
      loadManager.onStart = function ( url, itemsLoaded, itemsTotal ) {
      	console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
      };
      loadManager.onLoad = function ( ) {
        const continue_btn = document.querySelector(".continue");
        continue_btn.classList.add("ready");
        continue_btn.onclick = function(){
          document.querySelector(".preload").classList.add("preload-finish");
          document.querySelector(".intro").classList.add("ready");
        }
      };
      loadManager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
      	console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
        document.getElementById('progress').innerHTML = (100*itemsLoaded/itemsTotal).toFixed(0)+"%";
        console.log(Math.floor(itemsLoaded*publish_time.length/itemsTotal));
        var loadingAnimation = document.getElementById('loadingAnimation')
        loadingAnimation.innerHTML +=  publish_time[Math.floor(itemsLoaded*(publish_time.length-1)/itemsTotal)]+" ";
        loadingAnimation.style.lineHeight = (innerWidth/itemsTotal)/2.5;
        console.log(loadingAnimation.style.fontSize.toString().substring(0,2));
      };
      loadManager.onError = function ( url ) {
      	console.log( 'There was an error loading ' + url );
      };

      document.querySelector(".start").onclick = function () {
        document.querySelector(".start").style.display = "none";
        document.querySelector(".intro").classList.add("preload-finish");
      };

    }

    window.addEventListener( 'resize', onWindowResize, false );
    addClock();
    initBoxPos();
    loadAudio();
    animate();
  }
  var handMinuteParent, handHourParent, handSecondParent;
  var handMinuteParent_real, handHourParent_real, handSecondParent_real;

  function addClock(){
    //-------------------------------------------------------------
    var radius = 5;

    var geometry_ring = new THREE.RingBufferGeometry( radius, radius+0.3, 32 );
    var material_ring = new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.DoubleSide } );
    var mesh_ring = new THREE.Mesh( geometry_ring, material_ring );


    var geometry_circle = new THREE.CircleGeometry( radius, 32 );

    const material_circle = new THREE.MeshPhongMaterial({
      color: 0xcfcfcf,
      opacity: 0.15,
      transparent: true,
    });

    var circle = new THREE.Mesh( geometry_circle, material_circle );

    // minute hand
    handMinuteParent = new THREE.Object3D();
    var geometry_box_1 = new THREE.BoxGeometry( radius*0.7, 0.2, 0.1 );
    var material_box_1 = new THREE.MeshBasicMaterial( {color: 0xeb4034} );
    var handMinute = new THREE.Mesh( geometry_box_1, material_box_1 );
    handMinuteParent.add(handMinute);
    handMinute.translateOnAxis(new THREE.Vector3( 1, 0, 0 ), radius*0.35 );

    // hour hand
    handHourParent = new THREE.Object3D();
    var geometry_box_2 = new THREE.BoxGeometry( radius/3, 0.3, 0.1 );
    var material_box_2 = new THREE.MeshBasicMaterial( {color: 0x000fff} );
    var handHour = new THREE.Mesh( geometry_box_2, material_box_2 );
    handHourParent.add(handHour);
    handHour.translateOnAxis(new THREE.Vector3( 1, 0, 0 ), radius/6 );

    // second hand
    handSecondParent = new THREE.Object3D();
    var geometry_box_3 = new THREE.BoxGeometry( radius*0.8, 0.1, 0.1 );
    var material_box_3 = new THREE.MeshBasicMaterial( {color: 0x00000} );
    var handSecond = new THREE.Mesh( geometry_box_3, material_box_3 );
    handSecondParent.add(handSecond);
    handSecond.translateOnAxis(new THREE.Vector3( 1, 0, 0 ), radius*0.4 );

    var group = new THREE.Group();
    group.add( circle );
    group.add( mesh_ring );

    group.add( handMinuteParent );
    group.add( handHourParent );
    group.add( handSecondParent );

    scene.add(group);
    camera.add(group);
    group.position.set(10,12,-20);
    group.scale.set(0.4,0.4,1);

    // ----------------------the real time clock-----------------------------
    var radius = 5;
    var circle = new THREE.Mesh( geometry_circle, material_circle );
    // minute hand
    handMinuteParent_real = new THREE.Object3D();

    var handMinute_real = new THREE.Mesh( geometry_box_1, material_box_1 );
    handMinuteParent_real.add(handMinute_real);
    handMinute_real.translateOnAxis(new THREE.Vector3( 1, 0, 0 ), radius*0.4 );

    // hour hand
    handHourParent_real = new THREE.Object3D();
    var handHour_real = new THREE.Mesh( geometry_box_2, material_box_2 );
    handHourParent_real.add(handHour_real);
    handHour_real.translateOnAxis(new THREE.Vector3( 1, 0, 0 ), radius/6 );

    // second hand
    handSecondParent_real = new THREE.Object3D();
    var handSecond_real = new THREE.Mesh( geometry_box_3, material_box_3 );
    handSecondParent_real.add(handSecond_real);
    handSecond_real.translateOnAxis(new THREE.Vector3( 1, 0, 0 ), radius/2 );

    var group_real = new THREE.Group();
    group_real.add( circle );
    group_real.add( handMinuteParent_real );
    group_real.add( handHourParent_real );
    group_real.add( handSecondParent_real );

    scene.add(group_real);
    camera.add(group_real);
    group_real.position.set(-10,12,-20);
    group_real.scale.set(0.4,0.4,1);
    console.log(group_real);
    group_real.rotation.z = (Math.PI/2);
  }

  function initBoxPos(){
    for (var key in dict) {
      objects.forEach((obj, i) => {
          var date_value = obj.material[1].map.image.id;
          for (var z = 0; z < dict[key].length; z++){
            if (date_value == dict[key][z].canvas.id) {
              var the_date = key.substring(3,5);
              var the_integer = parseInt(the_date, 10);

              console.log(the_integer);
              obj.position.z = -(30-the_integer) * 50;
              obj.position.y = Math.floor( Math.random() * 10 ) * 4 + 10;
              obj.position.x = Math.floor( Math.random() * 20 - 10 ) * 20;
              obj.rotation.y = Math.random() * 20;
            }
          }
      });
    }
  }

  function loadAudio(){
    var sound = new Howl({
      src: ['Beishan.mp3'],
      autoplay: true,
      loop: true
    });
    sound.play();
    var muted = false;
    document.getElementById("mute_btn").onclick = function() {
      console.log(muted);
      if (!muted) {
        sound.mute(true);
        muted = true;
      }else {
        sound.mute(false);
        muted = false;
      }
    };
  }
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
  }

  var rotObjectMatrix;
  function rotateAroundObjectAxis(object, axis, radians) {
      rotObjectMatrix = new THREE.Matrix4();
      rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);

      // old code for Three.JS pre r54:
      // object.matrix.multiplySelf(rotObjectMatrix);      // post-multiply
      // new code for Three.JS r55+:
      object.matrix.multiply(rotObjectMatrix);

      // old code for Three.js pre r49:
      // object.rotation.getRotationFromMatrix(object.matrix, object.scale);
      // old code for Three.js r50-r58:
      // object.rotation.setEulerFromRotationMatrix(object.matrix);
      // new code for Three.js r59+:
      object.rotation.setFromRotationMatrix(object.matrix);
  }
  var rotWorldMatrix;
  // Rotate an object around an arbitrary axis in world space
  function rotateAroundWorldAxis(object, axis, radians) {
      rotWorldMatrix = new THREE.Matrix4();
      rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);

      // old code for Three.JS pre r54:
      //  rotWorldMatrix.multiply(object.matrix);
      // new code for Three.JS r55+:
      rotWorldMatrix.multiply(object.matrix);                // pre-multiply

      object.matrix = rotWorldMatrix;

      // old code for Three.js pre r49:
      // object.rotation.getRotationFromMatrix(object.matrix, object.scale);
      // old code for Three.js pre r59:
      // object.rotation.setEulerFromRotationMatrix(object.matrix);
      // code for r59+:
      object.rotation.setFromRotationMatrix(object.matrix);
  }
  function animate() {
    requestAnimationFrame( animate );

    if ( controls.isLocked === true ) {
      // update clock hands
      var date = new Date();
      console.log(date);
  		var hrs = date.getHours();
  		var min = date.getMinutes();
  		var sec = date.getSeconds();

  		var handHourR = (30 * (hrs > 12 ? hrs - 12 : hrs) * Math.PI) / 180;
  		var handMinuteR = (6 * min * Math.PI) / 180;
  		var handSecondR = (6 * sec * Math.PI) / 180;

      handSecondParent.rotation.z = -camera.position.z * 0.3;
      handMinuteParent.rotation.z = -camera.position.z * 0.3/60;
      handHourParent.rotation.z = -camera.position.z * 0.3/3600;

      handSecondParent_real.rotation.z = -handSecondR;
      handMinuteParent_real.rotation.z = -handMinuteR;
      handHourParent_real.rotation.z = -handHourR;

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
