// alert("hello world");
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';



const scene = new THREE.Scene();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const canvas = document.getElementById("experience-canvas");
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Initialize chart variables
let dataChart = null;
const chartContainer = document.getElementById("chartContainer");
const closeChartButton = document.getElementById("closeChartButton");
const ctx = document.getElementById("dataChart").getContext("2d");


// Reading counter and auto-save interval
let readingCount = 0;
const AUTO_SAVE_INTERVAL = 2880; // Save after every 2880 readings

// Chart The Data    
// Sensor history for the last day (2880 readings)
const sensorHistory = {
    temperature: [],
    humidity: [],
    moisture: [],
    soilEC: [],
    co2: [],
    atmosphericPress: []
};

// Then modify your getData() function to store history
async function getData() {
    try {
        const response = await fetch("https://valk-huone-1.onrender.com/api/data");
        const data = await response.json();
        
          
        // Access data from sensor1 (1061612) - likely has temperature and humidity
        const tempHumidityData = data.sensor1.readings || [];
        // Access data from sensor2 (6305245) - likely has moisture
        const moistureSoilECData = data.sensor2.readings || [];
        // Access data from sensor3 (3147479) - likely has moisture
        const AtmosphereCO2Data = data.sensor3.readings || [];
    
        // Extract values
        const temperatureReading = tempHumidityData.find(r => r.metric === "1");
        const humidityReading = tempHumidityData.find(r => r.metric === "2");
        const moistureReading = moistureSoilECData.find(r => r.metric === "8");
        const soilECReading = moistureSoilECData.find(r => r.metric === "10");
        const co2Reading = AtmosphereCO2Data.find(r => r.metric === "3");
        const atmosphericPressReading = AtmosphereCO2Data.find(r => r.metric === "4");

        
        // Add new readings to history (keeping last 120 readings)
        if (temperatureReading) {
            const roundedTemp = parseFloat(temperatureReading.value).toFixed(1);
            document.getElementById('temperature').textContent = roundedTemp;
            sensorHistory.temperature.push(roundedTemp);
            if (sensorHistory.temperature.length > 120) sensorHistory.temperature.shift();
        }
        if (humidityReading) {
            const roundedHumidity = parseFloat(humidityReading.value).toFixed(1);
            document.getElementById('humidity').textContent = roundedHumidity;
            sensorHistory.humidity.push(roundedHumidity);
            if (sensorHistory.humidity.length > 120) sensorHistory.humidity.shift();
        }
        if (moistureReading) {
            const roundedMoisture = parseFloat(moistureReading.value).toFixed(1);
            document.getElementById('moisture').textContent = roundedMoisture;
            sensorHistory.moisture.push(roundedMoisture);
            if (sensorHistory.moisture.length > 120) sensorHistory.moisture.shift();
        }
        if (soilECReading) {
            const roundedSoilEC = parseFloat(soilECReading.value).toFixed(3);
            document.getElementById('soilEC').textContent = roundedSoilEC;
            sensorHistory.soilEC.push(roundedSoilEC);
            if (sensorHistory.soilEC.length > 120) sensorHistory.soilEC.shift();
        }
        if (co2Reading) {
            const roundedCO2 = parseFloat(co2Reading.value).toFixed(0);
            document.getElementById('co2').textContent = roundedCO2;
            sensorHistory.co2.push(roundedCO2);
            if (sensorHistory.co2.length > 120) sensorHistory.co2.shift();
        }
        if (atmosphericPressReading) {
            const roundedAtmosphericPress = parseFloat(atmosphericPressReading.value).toFixed(0);
            document.getElementById('atmosphericPress').textContent = roundedAtmosphericPress;
            sensorHistory.atmosphericPress.push(roundedAtmosphericPress);
            if (sensorHistory.atmosphericPress.length > 120) sensorHistory.atmosphericPress.shift();
        }

        // Increment the reading count
        readingCount++;
        
        // Check if it's time to auto-save
        if (readingCount >= AUTO_SAVE_INTERVAL) {
            readingCount = 0; // Reset counter
            downloadData(); // Trigger the download
        }

        // If chart is visible, update it
        if (dataChart && !chartContainer.classList.contains("hidden")) {
            const currentDataType = graphDataDropdown.value;
            if (currentDataType) {
                showChart(currentDataType);
            }
        }
    } catch (err) {
        console.error("Fetch error:", err);
    }
}

// Call immediately and then every 60 seconds
getData();
setInterval(getData, 60000); // 60000 ms = 60 seconds

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize( sizes.width, sizes.height );
renderer.setPixelRatio(Math.min( window.devicePixelRatio, 2));
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;


const modalContent = {
    // Monitor: {
    //     title: "Dashboard",
    //     content: "This is a monitor.",
    //     link:"https://www.youtube.com",
    // },
    Thermometer: {
        title: "Thermometer",
    },
    Pump: {
        title: "Pump",
    },
    WaterTank: {
        title: "Water Tank",
    },
    Filter: {
        title: "Filter",
    },
    AirCon: {
        title: "Air Conditioning",
    },
    Container: {
        title: "Container",
    },
    StrawBerries1: {
        title: "Strawberry",
    },
    StrawBerries2: {
        title: "Strawberry",
    },
    StrawBerries3: {
        title: "Strawberry",
    },
    Plate01: {
        title: "LinkedIn",
        content: "Bio.",
        link:"https://www.linkedin.com/in/mark-johnson-panelo-82030a325",
    },
    Plate02: {
        title: "Strawberry Room",
        content: "is a Digital Twin of Metropolia's UrbanFarmLab. A dynamic virtual representation that mirror physical form, condition and events inside the Lab. For more information about the UrbanFarmLab, visit the link above.",
        link:"https://www.metropolia.fi/en/rdi/collaboration-platforms/urbanfarmlab",
        // image: "https://via.placeholder.com/400x200",
    },
};

const modal = document.querySelector(".modal");
const modalTitle = document.querySelector(".modal-title");
const modalProjectDescription = document.querySelector(".modal-project-description");
const modalExitButton = document.querySelector(".modal-exit-button");
const modalVisitButton = document.querySelector(".modal-visit-button");

function showModal(id){
    const content = modalContent[id];
    // const modalImage = document.querySelector(".modal-image");

    if (content) {
        modalTitle.textContent = content.title;
        modalProjectDescription.textContent = content.content;

        // Show image if available
        // if (content.image) {
        //   modalImage.src = content.image;
        //   modalImage.classList.remove("hidden");
        // } else {
        //   modalImage.classList.add("hidden");
        //   modalImage.src = ""; // clear previous image
        // }

        if (content.link) {
            modalVisitButton.href = content.link;
            modalVisitButton.classList.remove("hidden");
        }else {
            modalVisitButton.classList.add("hidden");
        }


        modal.classList.toggle("hidden");
    }
}

function hideModal(){
    modal.classList.toggle("hidden");
}


let intersectObject = "";
const intersectObjects = [];
const intersectObjectsNames = [

    // "Monitor",
    // "Clock",
    "AirCon",
    // "ExhaustFan",
    "Container",
    "WaterTank",
    "Filter",
    "Pump",
    // "WS",
    // "Racks",
    // "DrainPipe",
    // "PlantBase",
    "Plate01",
    "Plate02",
    "Thermometer",
    "StrawBerries1",
    "StrawBerries2",
    "StrawBerries3",
];

// Loading screen and loading manager
// See: https://threejs.org/docs/#api/en/loaders/managers/LoadingManager
const loadingScreen = document.getElementById("loadingScreen");
const enterButton = document.querySelector(".enter-button");

const manager = new THREE.LoadingManager();

manager.onLoad = function () {
  const t1 = gsap.timeline();

  t1.to(enterButton, {
    opacity: 1,
    duration: 0,
  });
};

enterButton.addEventListener("click", () => {

  gsap.to(loadingScreen, {
    opacity: 0,
    duration: 2,
    onComplete: () => {
      loadingScreen.remove();
      document.getElementById("mainContent").style.display = "block";
    },
  });
});




let exhaustFan = null;
let clockHandShort = null;
let clockHandLong = null;
let videoMesh = null;

// let smokerObject = null;
let smokeParticles = [];
let smokeMaterial = null;


const loader = new GLTFLoader();

// loader.setDecoderPath( './FarmLab_WhiteRoom03_Trial.glb', function ( glb ) {

loader.load( './FarmLab_WhiteRoom03_Trial.glb', function ( glb ) {
  const video = document.createElement('video');
  video.src = 'DigitalTwins2.mp4';
  video.crossOrigin = 'anonymous';
  video.loop = true;
  // video.muted = true;
  video.playsInline = true;
  video.autoplay = true;
  video.volume = 0.2; // Set volume to a very low value
  video.load();

  const videoTexture = new THREE.VideoTexture(video);
  videoTexture.flipY = false; // Fixes the video texture orientation
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;
  videoTexture.format = THREE.RGBAFormat;

  // Create smoke emitters for Smoker1, Smoker2, Smoker3
  const smokerNames = ["Smoker1", "Smoker2", "Smoker3"];
  const smokeTexture = new THREE.TextureLoader().load('Smoke5.gif');
  smokeMaterial = new THREE.SpriteMaterial({
    map: smokeTexture,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
  });
  
  glb.scene.traverse((child) => {
    
    // Emit Smoke from Smoker1 - Smoker3
    if (smokerNames.includes(child.name)) {
      const smoker = child;

      for (let i = 0; i < 25; i++) {
        const sprite = new THREE.Sprite(smokeMaterial.clone());
        sprite.scale.set(0.6, 0.8, 0.6); // Adjust size as needed
        sprite.position.set(
          smoker.position.x + (Math.random() - 0.5) * 0.5,
          smoker.position.y + Math.random() * -1,
          smoker.position.z + (Math.random() - 0.5) * 0.5
        );
        sprite.userData.origin = smoker.position.clone();
        sprite.visible = false;
        scene.add(sprite);
        smokeParticles.push(sprite);
      }
    }

    // Plays Video on Screen object
    if (child.name === "Screen") {
      child.material = new THREE.MeshBasicMaterial({ map: videoTexture });
      videoMesh = child;
      video.play();
    }

    if (intersectObjectsNames.includes(child.name)) {
      intersectObjects.push(child);
    }

    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }


    if (intersectObjectsNames.includes(child.name)) {
        intersectObjects.push(child);
    }

    // HIDE specific objects
    if (["ColdWind1", "ColdWind2", "WaterDrop01", "WaterDrop02"].includes(child.name)) {
      child.visible = false;
    }
    // For the animation of the water and cold wind
    if (child.name === "WaterDrop01") {
      water1 = child;
      water1.visible = false;
    }
    if (child.name === "WaterDrop02") {
      water2 = child;
      water2.visible = false;
    }

    if (child.name === "ColdWind1") {
      coldWind1 = child;
      coldWind1.visible = false;
    }
    if (child.name === "ColdWind2") {
      coldWind2 = child;
      coldWind2.visible = false;
    }

    // For the animation of Exhaust Fan and Clock
    if (child.name === "ExhaustFan") {
        exhaustFan = child;
    }
    if (child.name === "ClockHandShort") {
        clockHandShort = child;
    }
    if (child.name === "ClockHandLong") {
        clockHandLong = child;
    }

    if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
    }


  });
  scene.add( glb.scene );

}, undefined, function ( error ) {

  console.error( error );

} );

loader.load('./Strawberries1.glb', function(gltf) {
  const model1 = gltf.scene;
  scene.add(model1);
});
loader.load('./Strawberries2.glb', function(gltf) {
  const model2 = gltf.scene;
  scene.add(model2);
});
loader.load('./Strawberries3.glb', function(gltf) {
  const model3 = gltf.scene;
  scene.add(model3);
});

const width = .2;
const height = 4.18;
const intensity = 25;

const width2 = .1;
const height2 = 1.43;
const intensity2 = 1;

const rectLight1 = new THREE.RectAreaLight(0xff69b4, intensity, width, height);
rectLight1.position.set(2.42, 5.21, .9);
rectLight1.lookAt(2.42, 0, .9);
rectLight1.intensity = 0;
rectLight1.visible = false;
scene.add(rectLight1);

const rectLightHelper1 = new RectAreaLightHelper(rectLight1);
rectLight1.add(rectLightHelper1);

const rectLight2 = new THREE.RectAreaLight(0xff69b4, intensity, width, height);
rectLight2.position.set(-1.75, 5.21, .9);
rectLight2.lookAt(-1.75, 0, .9);
rectLight2.intensity = 0;
rectLight2.visible = false;
scene.add(rectLight2);

const rectLightHelper2 = new RectAreaLightHelper(rectLight2);
rectLight2.add(rectLightHelper2);

const rectLight3 = new THREE.RectAreaLight(0xff69b4, intensity, width, height);
rectLight3.position.set(2.42, 7.21, .9);
rectLight3.lookAt(2.42, 0, .9);
rectLight3.intensity = 0;
rectLight3.visible = false;
scene.add(rectLight3);

const rectLightHelper3 = new RectAreaLightHelper(rectLight3);
rectLight3.add(rectLightHelper3);

const rectLight4 = new THREE.RectAreaLight(0xff69b4, intensity, width, height);
rectLight4.position.set(-1.75, 7.21, .9);
rectLight4.lookAt(-1.75, 0, .9);
rectLight4.intensity = 0;
rectLight4.visible = false;
scene.add(rectLight4);

const rectLightHelper4 = new RectAreaLightHelper(rectLight4);
rectLight4.add(rectLightHelper4);

const rectLight5 = new THREE.RectAreaLight(0xff69b4, intensity, width, height);
rectLight5.position.set(2.42, 3.21, .9);
rectLight5.lookAt(2.42, 0, .9);
rectLight5.intensity = 0;
rectLight5.visible = false;
scene.add(rectLight5);

const rectLightHelper5 = new RectAreaLightHelper(rectLight5);
rectLight5.add(rectLightHelper5);

const rectLight6 = new THREE.RectAreaLight(0xff69b4, intensity, width, height);
rectLight6.position.set(-1.75, 3.21, .9);
rectLight6.lookAt(-1.75, 0, .9);
rectLight6.intensity = 0;
rectLight6.visible = false;
scene.add(rectLight6);

const rectLightHelper6 = new RectAreaLightHelper(rectLight6);
rectLight6.add(rectLightHelper6);

const rectLight7 = new THREE.RectAreaLight(0xffffff, intensity2, width2, height2);
rectLight7.position.set(-3.72, 6.68, 5.5);
rectLight7.lookAt(-3.72, 0, 5.5);
rectLight7.intensity = 0;
rectLight7.visible = false;
scene.add(rectLight7);

const rectLightHelper7 = new RectAreaLightHelper(rectLight7);
rectLight7.add(rectLightHelper7);

const rectLight8 = new THREE.RectAreaLight(0xffffff, intensity2, width2, height2);
rectLight8.position.set(-3.72, 5.3, 5.5);
rectLight8.lookAt(-3.72, 0, 5.5);
rectLight8.intensity = 0;
rectLight8.visible = false;
scene.add(rectLight8);

const rectLightHelper8 = new RectAreaLightHelper(rectLight8);
rectLight8.add(rectLightHelper8);


const sun = new THREE.DirectionalLight( 0xFFFFFF );
sun.castShadow = true;
sun.position.set( 40, 40, 20 );
sun.target.position.set( 0, 0, 0 );
sun.shadow.mapSize.width = 4096; // default
sun.shadow.mapSize.height = 4096; // default
sun.shadow.camera.left = -50;
sun.shadow.camera.right = 50;
sun.shadow.camera.top = 50;
sun.shadow.camera.bottom = -50;
sun.shadow.normalBias = 0.2;
scene.add( sun );


const light = new THREE.AmbientLight( 0x404040, 4 ); // soft white light
scene.add( light );

// const aspect = sizes.width / sizes.height;

const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 1000 );
camera.position.set(13.3, 5.4, 12.8);
camera.lookAt(0, 4, 0);

const controls = new OrbitControls( camera, canvas );
controls.target.set(0, 4, 0);
controls.update();


function onResize() {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    const aspect = sizes.width / sizes.height;
    camera.left = -aspect * 50;
    camera.right = aspect * 50;
    camera.top = 50;
    camera.bottom = -50;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min( window.devicePixelRatio, 2));
}

// function jumpPlants(meshID) {
//     const mesh = scene.getObjectByName(meshID);
//     if (!mesh) return;
  
//     const jumpHeight = 2;
//     const jumpDuration = 0.5;
  
//     const startY = mesh.position.y; // <- SAVE the original Y
  
//     const t1 = gsap.timeline();
  
//     t1.to(mesh.scale, {
//       x: 1,
//       y: 0.8,
//       z: 1.2,
//       duration: jumpDuration * 0.3,
//       ease: "power2.out",
//     });
  
//     t1.to(mesh.position, {
//       y: startY + jumpHeight,
//       duration: jumpDuration * 0.3,
//       ease: "power2.out",
//     }, "<");
  
//     t1.to(mesh.position, {
//       y: startY, // <- use the saved Y
//       duration: jumpDuration * 0.5,
//       ease: "bounce.out",
//     });
  
//     t1.to(mesh.scale, {
//       x: 1,
//       y: 1,
//       z: 1,
//       duration: jumpDuration * 0.5,
//       ease: "elastic.out(1, 0.3)",
//     });
//   }

function onClick() {
    if(intersectObject !== ""){
    //   if([
    // // "ExhaustFan",
    // // "Monitor",
    // // "PlantBase",
    // // "Plate01",
    // // "Plate02",
    // // "Thermometer",
    // // "Clock",
    // "StrawBerries1",
    // "StrawBerries2",
    // "StrawBerries3"].includes(intersectObject)){
    //     jumpPlants(intersectObject);
    //   } else 
      {
        showModal(intersectObject);
      }
    }
}


function onPointerMove( event ) {
	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

modalExitButton.addEventListener("click", hideModal);
window.addEventListener("resize", onResize);
window.addEventListener("click", onClick);
window.addEventListener( "pointermove", onPointerMove );


function animate() {
  // controls.enablePan = true;

  controls.maxDistance = 35; // or whatever feels right
  controls.minDistance = 10;

  // Vertical limits (up/down)
  controls.minPolarAngle = THREE.MathUtils.degToRad(35); // 35° down
  controls.maxPolarAngle = THREE.MathUtils.degToRad(90); // 90° up

  // Horizontal limits (left/right)
  controls.minAzimuthAngle = THREE.MathUtils.degToRad(5); // 5° left
  controls.maxAzimuthAngle = THREE.MathUtils.degToRad(80);  // 85° right

  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  if (controls.target.x > 5) controls.target.x = 5;    // 3m right limit
  if (controls.target.x < -4.5) controls.target.x = -4.5;  // 3m left limit

  if (controls.target.z > 5) controls.target.z = 5;    // 3m right limit
  if (controls.target.z < -4.5) controls.target.z = -4.5;  // 3m left limit

  if (controls.target.y > 8) controls.target.y = 8;    // 3m right limit
  if (controls.target.y < 2) controls.target.y = 2;  // 3m left limit

  controls.update();

  // Update smoke particles (falling + spreading)
  if (isFanOn && smokeParticles.length > 0) {
    smokeParticles.forEach(p => {
      p.visible = true;
      p.position.y -= 0.02; // go downward instead of up
      p.position.x += (Math.random() - 0.5) * 0.002; // slight horizontal spread
      p.position.z += (Math.random() - 0.5) * 0.002;
      p.material.opacity -= 0.0015;

      if (p.material.opacity <= 0) {
        const origin = p.userData.origin;
        p.position.set(
          origin.x + (Math.random() - 0.5) * 0.5,
          origin.y - 1.5 + Math.random() * 2,
          origin.z + (Math.random() - 0.5) * 0.5
        );
        p.material.opacity = 0.2;
      }
    });
  } else {
    smokeParticles.forEach(p => {
      p.visible = false;
    });
  }



  raycaster.setFromCamera( pointer, camera );

	const intersects = raycaster.intersectObjects(intersectObjects);

    if ( intersects.length > 0 ) {
        document.body.style.cursor = 'pointer';
    } else {
        document.body.style.cursor = 'default';
        intersectObject = "";
    }

	for ( let i = 0; i < intersects.length; i ++ ) {
        intersectObject = intersects[0].object.parent.name;
	}

  if (exhaustFan) {
  exhaustFan.rotation.y += 0.08; // Adjust speed as needed
  }
  if (clockHandShort) {
  clockHandShort.rotation.y -= 0.00001; // Adjust speed as needed
  }
  if (clockHandLong) {
  clockHandLong.rotation.y -= 0.0003; // Adjust speed as needed
  }

    renderer.render( scene, camera );
}

  renderer.setAnimationLoop( animate );

  // Codes for Display of Time and Date
  function updateDateTime() {
    const now = new Date();

    // const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const optionsDate = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = now.toLocaleDateString(undefined, optionsDate);

    const formattedTime = now.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    document.getElementById('vantaa-date').textContent = formattedDate;
    document.getElementById('vantaa-clock').textContent = formattedTime;
    }

    updateDateTime();
    setInterval(updateDateTime, 1000);

// Codes for Connection to Server and Buttons

const client = mqtt.connect("wss://test.mosquitto.org:8081");

const fanToggleButton = document.getElementById("fanToggleButton");
const pumpToggleButton = document.getElementById("pumpToggleButton");
const plantLightToggleButton = document.getElementById("plantLightToggleButton");
// const doorToggleButton = document.getElementById("doorToggleButton");

let isFanOn = false;
// let isBulbOn = false;
let isPumpOn = false;
let isPlantLightOn = false;
// let isDoorOn = false;

function updateButtonState(button, isOn, onLabel, offLabel) {
  button.textContent = isOn ? onLabel : offLabel;
}


let coldWind1 = null;
let coldWind2 = null;
let coldWindToggleInterval = null;
function updateFanButton(state) {
  isFanOn = state === "ON";
  updateButtonState(fanToggleButton, isFanOn, "🌀ON", "🥵OFF");

  if (isFanOn) {
    let toggle = false;
    if (coldWindToggleInterval) clearInterval(coldWindToggleInterval);
    coldWindToggleInterval = setInterval(() => {
      if (coldWind1 && coldWind2) {
        toggle = !toggle;
        coldWind1.visible = toggle;
        coldWind2.visible = !toggle;
      }
    }, 500);
  } else {
    if (coldWindToggleInterval) clearInterval(coldWindToggleInterval);
    coldWindToggleInterval = null;
    if (coldWind1) coldWind1.visible = false;
    if (coldWind2) coldWind2.visible = false;
  }
}

function updatePlantLightButton(state) {
  isPlantLightOn = state === "ON";
  updateButtonState(plantLightToggleButton, isPlantLightOn, "💡ON", "🕯️OFF");

  const plantLights = [rectLight1, rectLight2, rectLight3, rectLight4, rectLight5, rectLight6];
  // const plantLights2 = [rectLight7, rectLight8];
  

  plantLights.forEach(light => {
    gsap.to(light, {
      intensity: isPlantLightOn ? 25 : 0, // match initial intensity
      duration: 1
    });
    light.visible = isPlantLightOn;
  });

  // plantLights2.forEach(light => {
  //   gsap.to(light, {
  //     intensity: isPlantLightOn ? 5 : 0, // match initial intensity
  //     duration: 1
  //   });
  //   light.visible = isPlantLightOn;
  // });
}




let water1 = null;
let water2 = null;
let waterToggleInterval = null;
function updatePumpButton(state) {
  isPumpOn = state === "ON";
  updateButtonState(pumpToggleButton, isPumpOn, "🌧️ON", "🌵OFF");

  if (isPumpOn) {
    let toggle = false;
    if (waterToggleInterval) clearInterval(waterToggleInterval);
    waterToggleInterval = setInterval(() => {
      if (water1 && water2) {
        toggle = !toggle;
        water1.visible = toggle;
        water2.visible = !toggle;
      }
    }, 500);
  } else {
    if (waterToggleInterval) clearInterval(waterToggleInterval);
    waterToggleInterval = null;
    if (water1) water1.visible = false;
    if (water2) water2.visible = false;
  }
}



client.on("connect", () => {
  console.log("✅ Connected to MQTT broker");

  // Subscribe to all topics
  const topics = ["trial/fan", "trial/bulb", "trial/pump", "trial/plantLight", "trial/door"];

  topics.forEach(topic => {
    client.subscribe(topic, err => {
      if (!err) {
        console.log(`📡 Subscribed to topic: ${topic}`);
        // Request the retained message
        client.publish(topic, "", { qos: 0, retain: false });
      }
    });
  });
});

// Handle incoming messages
client.on("message", (topic, message) => {
  const msg = message.toString().trim();
  console.log(`📥 ${topic}: ${msg}`);

  if (["trial/fan", "trial/bulb", "trial/pump", "trial/plantLight"].includes(topic)) {
    if (msg !== "ON" && msg !== "OFF") return;

    switch (topic) {
      case "trial/fan":
        updateFanButton(msg);
        break;
      case "trial/bulb":
        updateBulbButton(msg);
        break;
      case "trial/pump":
        updatePumpButton(msg);
        break;
      case "trial/plantLight":
        updatePlantLightButton(msg);
        break;

    }
  }

});

const sunToggleButton = document.getElementById('sunToggleButton');

let isBright = true;


sunToggleButton.addEventListener('click', () => {

  isBright = !isBright;
  sunToggleButton.textContent = isBright ? '🌞' : '🌚';

  // Control rectLight7 and rectLight8 (INVERSE LOGIC)
  const lightsOn = !isBright; // Lights on when sun is off
  const targetIntensity = lightsOn ? 5 : 0; // Adjust intensity as needed
  gsap.to(rectLight7, {intensity: targetIntensity,duration: 1});
  gsap.to(rectLight8, {intensity: targetIntensity,duration: 1});
    // Ensure lights are visible when needed
  rectLight7.visible = lightsOn;
  rectLight8.visible = lightsOn;

  gsap.to(light, { intensity: isBright ? 4 : 1, duration: 1 });
  gsap.to(sun, { intensity: isBright ? 1 : 0, duration: 1 });
  renderer.setClearColor(isBright ? 0xeeeeee : 0x111111, 1);

  const containers = [
  document.getElementById('vantaa-date-container'),
  document.getElementById('vantaa-time-container'),
  document.getElementById('temperature-container'),
  document.getElementById('humidity-container'),
  document.getElementById('co2-container'),
  document.getElementById('atmosphericPress-container'),
  document.getElementById('moisture-container'),
  document.getElementById('soilElectroConductivity-container')
  ];


  const newFontColor = isBright ? 'black' : 'white';

  containers.forEach(container => {
    if (container) {
      container.style.color = newFontColor;
    }
  });

});

// Initialize lights to correct state
rectLight7.intensity = isBright ? 0 : 1;
rectLight8.intensity = isBright ? 0 : 1;
rectLight7.visible = !isBright;
rectLight8.visible = !isBright;


// Button click events to toggle and publish new state
fanToggleButton.addEventListener("click", () => {
  const newState = isFanOn ? "OFF" : "ON";
  client.publish("trial/fan", newState);
  updateFanButton(newState);
});


plantLightToggleButton.addEventListener("click", () => {
  const newState = isPlantLightOn ? "OFF" : "ON";
  client.publish("trial/plantLight", newState);
  updatePlantLightButton(newState);
});


pumpToggleButton.addEventListener("click", () => {
  const newState = isPumpOn ? "OFF" : "ON";
  client.publish("trial/pump", newState);
  updatePumpButton(newState);
})

// Toggle dropdown visibility
graphDataButton.addEventListener("click", () => {
    graphDataDropdown.classList.toggle("hidden");
});


// Update the dropdown event listener
graphDataDropdown.addEventListener("change", (event) => {
    const selectedValue = event.target.value;
    if (selectedValue) {
        showChart(selectedValue);
        graphDataDropdown.classList.add("hidden");
    }
});

// Close chart button
closeChartButton.addEventListener("click", () => {
    chartContainer.classList.add("hidden");
});

function showChart(dataType) {
    // Destroy previous chart if it exists
    if (dataChart) {
        dataChart.destroy();
    }

    // Get the appropriate label and unit based on data type
    let label, unit;
    
    switch(dataType) {
        case "temperature":
            label = "Temperature";
            unit = "°C";
            break;
        case "humidity":
            label = "Humidity";
            unit = "%";
            break;
        case "moisture":
            label = "Soil Moisture";
            unit = "%";
            break;
        case "soilEC":
            label = "Soil EC";
            unit = "mS/cm";
            break;
        case "co2":
            label = "CO2";
            unit = "ppm";
            break;
        case "atmosphericPress":
            label = "Atmospheric Pressure";
            unit = "hPa";
            break;
    }

    // Generate timestamp labels based on the current time and data length
    const dataLength = sensorHistory[dataType].length;
    const now = new Date();
    const labels = Array.from({length: dataLength}, (_, i) => {
        // Calculate timestamp for each data point (each point is 60 seconds apart)
        const dataTime = new Date(now.getTime() - (dataLength - i - 1) * 60000);
        return formatTimeForChart(dataTime);
    });

    // Create the chart
    dataChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${label} (${unit})`,
                data: sensorHistory[dataType],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${label}: ${context.parsed.y}${unit}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    },
                    ticks: {
                        // Auto-rotate labels if needed
                        autoSkip: true,
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: `${label} (${unit})`
                    }
                }
            }
        }
    });

    // Show the chart container
    chartContainer.classList.remove("hidden");
}

// Helper function to format time for chart display
function formatTimeForChart(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Add this near your other button declarations
const downloadToggleButton = document.getElementById("downloadToggleButton");

// Function to convert data to Excel and trigger download
function downloadData() {

    // Show a brief notification
    const notification = document.createElement('div');
    notification.textContent = 'Auto-saving data...';
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = 'rgba(0,0,0,0.7)';
    notification.style.color = 'white';
    notification.style.padding = '10px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '10000';
    document.body.appendChild(notification);
    
    // Remove the notification after 3 seconds
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 3000);
 
    // Get current timestamp for filename
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-").split('.')[0] + 'Z';
    const filename = `sensor_data_${timestamp}.xlsx`;
    
    // Prepare the data array
    const data = [];
    
    // Add headers
    data.push([
        "Timestamp",
        "Temperature (°C)",
        "Humidity (%)",
        "CO2 (ppm)",
        "Atmospheric Pressure (hPa)",
        "Soil Moisture (%)",
        "Soil EC (mS/cm)"
    ]);
    
    // Determine the maximum length of any sensor array
    const maxLength = Math.max(
        sensorHistory.temperature.length,
        sensorHistory.humidity.length,
        sensorHistory.co2.length,
        sensorHistory.atmosphericPress.length,
        sensorHistory.moisture.length,
        sensorHistory.soilEC.length
    );
    
    // Add data rows with timestamps
    for (let i = 0; i < maxLength; i++) {
        // Calculate timestamp for this row (each data point is 60 seconds apart)
        const rowTime = new Date(now.getTime() - (maxLength - i - 1) * 60000);
        
        // Format timestamp without milliseconds, matching your display
        const formattedTime = formatDateTimeForExcel(rowTime);
        
        data.push([
            formattedTime,
            sensorHistory.temperature[i] || "",
            sensorHistory.humidity[i] || "",
            sensorHistory.co2[i] || "",
            sensorHistory.atmosphericPress[i] || "",
            sensorHistory.moisture[i] || "",
            sensorHistory.soilEC[i] || ""
        ]);
    }
    
    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sensor Data");
    
    // Generate Excel file and trigger download
    XLSX.writeFile(wb, filename);

    // Clear the sensor history after saving
    sensorHistory.temperature = [];
    sensorHistory.humidity = [];
    sensorHistory.co2 = [];
    sensorHistory.atmosphericPress = [];
    sensorHistory.moisture = [];
    sensorHistory.soilEC = [];
    
    // Reset the reading count
    readingCount = 0;
}

// Helper function to format date/time consistently with your display
function formatDateTimeForExcel(date) {
    // Format as YYYY-MM-DD HH:MM:SS to match your display
    const pad = num => num.toString().padStart(2, '0');
    
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
           `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

// Add event listener to the download button
downloadToggleButton.addEventListener("click", downloadData);

enterButton.addEventListener("click", () => {
  video.muted = false;
  video.volume = 0.2; // Set volume to a very low value
  video.play(); // in case it needs to be triggered by user action
});

