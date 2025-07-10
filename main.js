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


// Chart The Data    
// Sensor history for the last day (2880 readings)
const sensorHistory = {
    temperature: [],
    humidity: [],
    moisture: [],
    soilEC: [],
    co2: [],
    atmosphericPress: [],
    poreEC: []
};

// Then modify your getData() function to store history
async function getData() {
    try {
        const response = await fetch("https://valk-huone-1.onrender.com/api/data");
        const data = await response.json();

        // Log camera data if available
        if (data.lastCameraShot) {
            console.log('Received camera data:', {
                id: data.lastCameraShot.id,
                timestamp: data.lastCameraShot.timestamp,
                imageUrl: data.lastCameraShot.imageUrl ? 'Available' : 'Not available'
            });
        } else {
            console.log('No camera data in response');
        }

        // Access historical data arrays
        if (data.tempHistory) {
            const tempValues = data.tempHistory.map(r => ({ time: r.time, value: r.value }));
            console.log("Temperature History:", tempValues);
            
            // You can store this in your sensorHistory if needed
            sensorHistory.temperature = tempValues; // Keep all readings
        }
        if (data.humidityHistory) {
            const humidityValues = data.humidityHistory.map(r => ({ time: r.time, value: r.value }));
            console.log("Humidity History:", humidityValues);
            
            // Store in sensorHistory
            sensorHistory.humidity = humidityValues;
        }
        if (data.co2History) {
            const co2Values = data.co2History.map(r => ({ time: r.time, value: r.value }));
            console.log("CO2 History:", co2Values);
            
            // Store in sensorHistory
            sensorHistory.co2 = co2Values;
        }
        if (data.atmosphericPressHistory) {
            const atmosphericPressValues = data.atmosphericPressHistory.map(r => ({ time: r.time, value: r.value }));
            console.log("Atmospheric Pressure History:", atmosphericPressValues);

            // Store in sensorHistory
            sensorHistory.atmosphericPress = atmosphericPressValues;
        }
        if (data.moistureHistory) {
            const moistureValues = data.moistureHistory.map(r => ({ time: r.time, value: r.value }));
            console.log("Moisture History:", moistureValues);

            // Store in sensorHistory
            sensorHistory.moisture = moistureValues;
        }
        if (data.soilECHistory) {
            const soilECValues = data.soilECHistory.map(r => ({ time: r.time, value: r.value }));
            console.log("Soil EC History:", soilECValues);

            // Store in sensorHistory
            sensorHistory.soilEC = soilECValues;
        }
        if (data.poreECHistory) {
            const poreECValues = data.poreECHistory.map(r => ({ time: r.time, value: r.value }));
            console.log("Pore EC History:", poreECValues);

            // Store in sensorHistory
            sensorHistory.poreEC = poreECValues;
        }

        // Access data from sensor1 (1061612) - likely has temperature and humidity
        const tempHumidityData = data.sensor1.readings || [];
        // Access data from sensor2 (6305245) - likely has moisture
        const moistureSoilECData = data.sensor2.readings || [];
        // Access data from sensor3 (3147479) - likely has moisture
        const AtmosphereCO2Data = data.sensor3.readings || [];
    
        // Extract values
        const temperatureReading = tempHumidityData.find(r => r.metric === "1");
        const humidityReading = tempHumidityData.find(r => r.metric === "2");
        const co2Reading = AtmosphereCO2Data.find(r => r.metric === "3");
        const atmosphericPressReading = AtmosphereCO2Data.find(r => r.metric === "4");
        const moistureReading = moistureSoilECData.find(r => r.metric === "8");
        const soilECReading = moistureSoilECData.find(r => r.metric === "10");
        const poreECReading = moistureSoilECData.find(r => r.metric === "11");

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
        if (poreECReading) {
            const roundedPoreEC = parseFloat(poreECReading.value).toFixed(3);
            document.getElementById('poreEC').textContent = roundedPoreEC;
            sensorHistory.poreEC.push(roundedPoreEC);
            if (sensorHistory.poreEC.length > 120) sensorHistory.poreEC.shift();
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
    CCTV: {
      title: "Thermal Camera View",
      content: "Live feed from the thermal camera",
      isCamera: true // Add this flag to identify camera modals
    },
    Pump: {
        title: "Watering Pump",
        content: "This is the Watering Pump, which is responsible for watering the plants inside the Lab. Above are the specifics of the pump.",
        image: "pumput.jpg"
    },
    Plate01: {
        title: "Contact Person",
        content: "Mark Johnson Panelo is a CIC program master's student at Metropolia University of Applied Sciences. He is currently working on the Digital Twin project for the UrbanFarmLab. <br>NOTE: For more information about Mark, visit the link above.",
        link:"https://www.linkedin.com/in/mark-johnson-panelo-82030a325",
        image: "meCartoon.jpg",
    },
    Plate02: {
        title: "Strawberry Room",
        content: "This is Strawberry Room, the Digital Twin of Metropolia's UrbanFarmLab. A dynamic virtual representation that mirror physical form, condition and events inside the Lab. For more information about the UrbanFarmLab, visit the link above. <br>NOTE: The objects with animation at the beginning are interactive and with animation.",
        link:"https://www.metropolia.fi/en/rdi/collaboration-platforms/urbanfarmlab",
        image: "Teacher.jpg",
    },
};

const modal = document.querySelector(".modal");
const modalTitle = document.querySelector(".modal-title");
const modalProjectDescription = document.querySelector(".modal-project-description");
const modalExitButton = document.querySelector(".modal-exit-button");
const modalVisitButton = document.querySelector(".modal-visit-button");


// function showModal(id) {
//     const content = modalContent[id];
//     if (content) {
//         if (content.isCamera) {
//             // Handle camera modal separately
//             cameraToggleButton.click(); // Trigger the camera button click
//         } else {
//             // Regular modal handling
//             modalTitle.textContent = content.title;
//             modalProjectDescription.textContent = content.content;

//             if (content.link) {
//                 modalVisitButton.href = content.link;
//                 modalVisitButton.classList.remove("hidden");
//             } else {
//                 modalVisitButton.classList.add("hidden");
//             }

//             modal.classList.toggle("hidden");
//         }
//     }
// }

function showModal(id) {
    const content = modalContent[id];
    if (content) {
        if (content.isCamera) {
            cameraToggleButton.click();
        } else {
            modalTitle.textContent = content.title;
            modalProjectDescription.innerHTML = content.content;

            // Remove any existing image container first
            const existingImage = document.querySelector('.modal-image-container');
            if (existingImage) existingImage.remove();

            // Only add new image if one is specified
            if (content.image) {
                const imageContainer = document.createElement('div');
                imageContainer.className = 'modal-image-container';
                imageContainer.innerHTML = `
                    <img src="${content.image}" alt="${content.title}" 
                         style="max-width: 500px; width: 100%; margin: 0 auto 20px; display: block;">
                `;
                
                // Insert the image before the description
                modalProjectDescription.parentNode.insertBefore(
                    imageContainer, 
                    modalProjectDescription
                );
            }

            if (content.link) {
                modalVisitButton.href = content.link;
                modalVisitButton.classList.remove("hidden");
            } else {
                modalVisitButton.classList.add("hidden");
            }

            modal.classList.toggle("hidden");
        }
    }
}

function hideModal(){
    modal.classList.toggle("hidden");
}

let intersectObject = "";
const intersectObjects = [];
const intersectObjectsNames = [
    // "AirCon",
    // "Monitor",
    // "Screen",
    "CCTV",
    "Pump",
    "Plate01",
    "Plate02",
    // "Thermometer",
    "StrawBerries1",
    "StrawBerries2",
    "StrawBerries3",
];

// Loading screen and loading manager
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
let smokeParticles = [];
let smokeMaterial = null;
let video;

let pump = null;
let ccTV = null;
let monitor = null;
let screen = null;
let clock = null;
let strawBerries1 = null;
let strawBerries2 = null;
let strawBerries3 = null;
let signHolder = null;
let plate01 = null;
let plate02 = null;

const loader = new GLTFLoader();

loader.load( './FarmLab_WhiteRoom05_Trial.glb', function ( glb ) {
  video = document.createElement('video');
  video.src = 'DigitalTwins2.mp4';
  video.crossOrigin = 'anonymous';
  video.loop = true;
  video.playsInline = true;
  video.autoplay = true;
  video.volume = 0.2;
  video.load();

  const videoTexture = new THREE.VideoTexture(video);
  videoTexture.flipY = false;
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
        sprite.scale.set(0.6, 0.8, 0.6);
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

    // For Intro  Animations
    if (child.name === "SignHolder") {
        signHolder = child;
        signHolder.visible = false;
        signHolder.scale.set(0, 0, 0); // Start scaled down
    }
    if (child.name === "Plate01") {
        plate01 = child;
        plate01.visible = false;
        plate01.scale.set(0, 0, 0); // Start scaled down
    }
    if (child.name === "Plate02") {
        plate02 = child;
        plate02.visible = false;
        plate02.scale.set(0, 0, 0); // Start scaled down
    }
    if (child.name === "Monitor") {
        monitor = child;
        monitor.visible = false;
        monitor.scale.set(0, 0, 0); // Start scaled down
    }
    if (child.name === "Screen") {    
        screen = child;
        screen.visible = false;
        screen.scale.set(0, 0, 0); // Start scaled down
    }
    if (child.name === "Clock") {
        clock = child;
        clock.visible = false;
        clock.scale.set(0, 0, 0); // Start scaled down
    }
    if (child.name === "Pump") {
        pump = child;
        pump.visible = false;
        pump.scale.set(0, 0, 0); // Start scaled down
    }
    if (child.name === "CCTV") {
        ccTV = child;
        ccTV.visible = false;
        ccTV.scale.set(0, 0, 0); // Start scaled down
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
        exhaustFan.visible = true; // Show the fan
        exhaustFan.scale.set(0, 0, 0); // Scale it down for better visibility
    }
    if (child.name === "ClockHandShort") {
        clockHandShort = child;
        clockHandShort.visible = false; // Hide initially
        clockHandShort.scale.set(0, 0, 0); // Start scaled down
    }
    if (child.name === "ClockHandLong") {
        clockHandLong = child;
        clockHandLong.visible = false; // Hide initially
        clockHandLong.scale.set(0, 0, 0); // Start scaled down
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
  model1.traverse((child) => {
      if (child.name === "StrawBerries1") {
        strawBerries1 = child;
        strawBerries1.visible = false;
        strawBerries1.scale.set(0, 0, 0); // Start scaled down
    }
  });

  scene.add(model1);
});
loader.load('./Strawberries2.glb', function(gltf) {
  const model2 = gltf.scene;
  model2.traverse((child) => {
      if (child.name === "StrawBerries2") {
        strawBerries2 = child;
        strawBerries2.visible = false;
        strawBerries2.scale.set(0, 0, 0); // Start scaled down
    }
  });
  scene.add(model2);
});
loader.load('./Strawberries3.glb', function(gltf) {
  const model3 = gltf.scene;
  model3.traverse((child) => {
      if (child.name === "StrawBerries3") {
        strawBerries3 = child;
        strawBerries3.visible = false;
        strawBerries3.scale.set(0, 0, 0); // Start scaled down
    }
  });
  scene.add(model3);
});



const width = .2;
const height = 4.18;
const intensity = 25;

const width2 = .1;
const height2 = 1.43;
const intensity2 = 1;

const rectLight1 = new THREE.RectAreaLight(0xff69b4, intensity, width, height);
rectLight1.position.set(2.72, 5.61, .6);
rectLight1.lookAt(2.72, 0, .6);
rectLight1.intensity = 0;
rectLight1.visible = false;
scene.add(rectLight1);

const rectLightHelper1 = new RectAreaLightHelper(rectLight1);
rectLight1.add(rectLightHelper1);

const rectLight2 = new THREE.RectAreaLight(0xff69b4, intensity, width, height);
rectLight2.position.set(-1.45, 5.61, .6);
rectLight2.lookAt(-1.45, 0, .6);
rectLight2.intensity = 0;
rectLight2.visible = false;
scene.add(rectLight2);

const rectLightHelper2 = new RectAreaLightHelper(rectLight2);
rectLight2.add(rectLightHelper2);

const rectLight3 = new THREE.RectAreaLight(0xff69b4, intensity, width, height);
rectLight3.position.set(2.72, 7.61, .6);
rectLight3.lookAt(2.72, 0, .6);
rectLight3.intensity = 0;
rectLight3.visible = false;
scene.add(rectLight3);

const rectLightHelper3 = new RectAreaLightHelper(rectLight3);
rectLight3.add(rectLightHelper3);

const rectLight4 = new THREE.RectAreaLight(0xff69b4, intensity, width, height);
rectLight4.position.set(-1.45, 7.61, .6);
rectLight4.lookAt(-1.45, 0, .6);
rectLight4.intensity = 0;
rectLight4.visible = false;
scene.add(rectLight4);

const rectLightHelper4 = new RectAreaLightHelper(rectLight4);
rectLight4.add(rectLightHelper4);

const rectLight5 = new THREE.RectAreaLight(0xff69b4, intensity, width, height);
rectLight5.position.set(2.72, 3.61, .6);
rectLight5.lookAt(2.72, 0, .6);
rectLight5.intensity = 0;
rectLight5.visible = false;
scene.add(rectLight5);

const rectLightHelper5 = new RectAreaLightHelper(rectLight5);
rectLight5.add(rectLightHelper5);

const rectLight6 = new THREE.RectAreaLight(0xff69b4, intensity, width, height);
rectLight6.position.set(-1.45, 3.61, .6);
rectLight6.lookAt(-1.45, 0, .6);
rectLight6.intensity = 0;
rectLight6.visible = false;
scene.add(rectLight6);

const rectLightHelper6 = new RectAreaLightHelper(rectLight6);
rectLight6.add(rectLightHelper6);

const rectLight7 = new THREE.RectAreaLight(0xffffff, intensity2, width2, height2);
rectLight7.position.set(-3.65, 3.86, 5.2);
rectLight7.lookAt(-3.42, 0, 5.2);
rectLight7.rotation.z = THREE.MathUtils.degToRad(-20);
rectLight7.intensity = 0;
rectLight7.visible = false;
scene.add(rectLight7);

const rectLightHelper7 = new RectAreaLightHelper(rectLight7);
rectLight7.add(rectLightHelper7);

const rectLight8 = new THREE.RectAreaLight(0xffffff, intensity2, width2, height2);
rectLight8.position.set(-3.65, 2.57, 5.2);
rectLight8.lookAt(-3.42, 0, 5.2);
rectLight8.rotation.z = THREE.MathUtils.degToRad(-20);
rectLight8.intensity = 0;
rectLight8.visible = false;
scene.add(rectLight8);

const rectLightHelper8 = new RectAreaLightHelper(rectLight8);
rectLight8.add(rectLightHelper8);

const sun = new THREE.DirectionalLight( 0xFFFFFF );
sun.castShadow = true;
sun.position.set( 40, 40, 20 );
sun.target.position.set( 0, 0, 0 );
sun.shadow.mapSize.width = 4096;
sun.shadow.mapSize.height = 4096;
sun.shadow.camera.left = -50;
sun.shadow.camera.right = 50;
sun.shadow.camera.top = 50;
sun.shadow.camera.bottom = -50;
sun.shadow.normalBias = 0.2;
scene.add( sun );

const light = new THREE.AmbientLight( 0x404040, 4 );
scene.add( light );

const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 1000 );
camera.position.set(30.3, 12.4, 29.8); // <-- Initial position (X, Y, Z)
camera.lookAt(0, 4, 0); // <-- Where the camera is pointing (X, Y, Z)

const controls = new OrbitControls( camera, canvas );
controls.target.set(0, 4, 0);
controls.update();

// Animate objects growth on load
function animateObjectsGrowth() {
    const duration = 2; // Animation duration in seconds
    const ease = "elastic.out(3, 1.5)"; // Bouncy effect
    
    if (pump) {
        pump.visible = true;
        gsap.to(pump.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: duration,
            ease: ease
        });
    }
    if (monitor) {
        monitor.visible = true;
        gsap.to(monitor.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: duration,
            ease: ease,
            delay: 0.5
        });
    }
    if (screen) {
        screen.visible = true;
        gsap.to(screen.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: duration,
            ease: ease,
            delay: 0.5
        });
    }
    if (clock) {
        clock.visible = true;
        gsap.to(clock.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: duration,
            ease: ease,
            delay: 1
        });
    }
    if (clockHandShort) {
        clockHandShort.visible = true;
        gsap.to(clockHandShort.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: duration,
            ease: ease,
            delay: 1
        });
    }
    if (clockHandLong) {
        clockHandLong.visible = true;
        gsap.to(clockHandLong.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: duration,
            ease: ease,
            delay: 1
        });
    }
    if (exhaustFan) {
        exhaustFan.visible = true;
        gsap.to(exhaustFan.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: duration,
            ease: ease,
            delay: 1.5
        });
    }
    if (ccTV) {
        ccTV.visible = true;
        gsap.to(ccTV.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: duration,
            ease: ease,
            delay: 2
        });
    }
    if (strawBerries1) {
        strawBerries1.visible = true;
        gsap.to(strawBerries1.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: duration,
            ease: ease,
            delay: 2.5
        });
    }
    if (strawBerries2) {
        strawBerries2.visible = true;
        gsap.to(strawBerries2.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: duration,
            ease: ease,
            delay: 3
        });
    }
    if (strawBerries3) {
        strawBerries3.visible = true;
        gsap.to(strawBerries3.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: duration,
            ease: ease,
            delay: 3.5
        });
    }

    if (signHolder) {
        signHolder.visible = true;
        gsap.to(signHolder.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: duration,
            ease: ease,
            delay: 4
        });
    }
    
    if (plate01) {
        plate01.visible = true;
        gsap.to(plate01.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: duration,
            ease: ease,
            delay: 4.5 // Slight delay for staggered effect
        });
    }
    
    if (plate02) {
        plate02.visible = true;
        gsap.to(plate02.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: duration,
            ease: ease,
            delay: 5 // Slight delay for staggered effect
        });
    }
}

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

function onClick() {
    if(intersectObject !== ""){
        showModal(intersectObject);
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
  controls.maxDistance = 45;
  controls.minDistance = 10;
  controls.minPolarAngle = THREE.MathUtils.degToRad(35);
  controls.maxPolarAngle = THREE.MathUtils.degToRad(90);
  controls.minAzimuthAngle = THREE.MathUtils.degToRad(5);
  controls.maxAzimuthAngle = THREE.MathUtils.degToRad(80);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  if (controls.target.x > 5) controls.target.x = 5;
  if (controls.target.x < -4.5) controls.target.x = -4.5;
  if (controls.target.z > 5) controls.target.z = 5;
  if (controls.target.z < -4.5) controls.target.z = -4.5;
  if (controls.target.y > 8) controls.target.y = 8;
  if (controls.target.y < 2) controls.target.y = 2;

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

  controls.update();

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
    exhaustFan.rotation.y += 0.08;
  }
  if (clockHandShort) {
    clockHandShort.rotation.y -= 0.00001;
  }
  if (clockHandLong) {
    clockHandLong.rotation.y -= 0.0003;
  }

    renderer.render( scene, camera );
}

renderer.setAnimationLoop( animate );

// Codes for Display of Time and Date
function updateDateTime() {
    const now = new Date();
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

// Device control variables and functions
let isFanOn = false;
let isPumpOn = false;
// let isPlantLightOn = false;

let coldWind1 = null;
let coldWind2 = null;
let coldWindToggleInterval = null;
let water1 = null;
let water2 = null;
let waterToggleInterval = null;

let deviceStates = {
  fan: "OFF",
  // plantLight: "OFF",
  pump: "OFF"
};

async function fetchDeviceStates() {
  try {
    const response = await fetch("https://valk-huone-1.onrender.com/api/device-states");
    const data = await response.json();
    deviceStates = data;
    
    // Update button states based on fetched values
    updateButtonState(fanToggleButton, deviceStates.fan === "ON", "🌀ON", "🥵OFF");
    // updateButtonState(plantLightToggleButton, deviceStates.plantLight === "ON", "💡ON", "🕯️OFF");
    updateButtonState(pumpToggleButton, deviceStates.pump === "ON", "🌧️ON", "🌵OFF");
    
    // Update actual device states
    isFanOn = deviceStates.fan === "ON";
    // isPlantLightOn = deviceStates.plantLight === "ON";
    isPumpOn = deviceStates.pump === "ON";
    
    // Update visual states
    updateFanVisuals();
    // updatePlantLightVisuals();
    updatePumpVisuals();
    
  } catch (err) {
    console.error("Error fetching device states:", err);
  }
}

// Add these helper functions
function updateFanVisuals() {
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

// function updatePlantLightVisuals() {
//   const plantLights = [rectLight1, rectLight2, rectLight3, rectLight4, rectLight5, rectLight6];
  
//   plantLights.forEach(light => {
//     gsap.to(light, {
//       intensity: isPlantLightOn ? 25 : 0,
//       duration: 1
//     });
//     light.visible = isPlantLightOn;
//   });
// }

function updatePumpVisuals() {
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

const fanToggleButton = document.getElementById("fanToggleButton");
const pumpToggleButton = document.getElementById("pumpToggleButton");
// const plantLightToggleButton = document.getElementById("plantLightToggleButton");

function updateButtonState(button, isOn, onLabel, offLabel) {
  button.textContent = isOn ? onLabel : offLabel;
}

async function toggleFan() {
  isFanOn = !isFanOn;
  const newState = isFanOn ? "ON" : "OFF";
  updateButtonState(fanToggleButton, isFanOn, "🌀ON", "🥵OFF");
  updateFanVisuals();
  
  try {
    await updateDeviceStateOnServer('fan', newState);
  } catch (err) {
    console.error("Error updating fan state:", err);
    // Revert if update fails
    isFanOn = !isFanOn;
    updateButtonState(fanToggleButton, isFanOn, "🌀ON", "🥵OFF");
    updateFanVisuals();
  }
}


// async function togglePlantLight() {
//   isPlantLightOn = !isPlantLightOn;
//   const newState = isPlantLightOn ? "ON" : "OFF";
//   updateButtonState(plantLightToggleButton, isPlantLightOn, "💡ON", "🕯️OFF");
//   updatePlantLightVisuals();
  
//   try {
//     await updateDeviceStateOnServer('plantLight', newState);
//   } catch (err) {
//     console.error("Error updating plant light state:", err);
//     // Revert if update fails
//     isPlantLightOn = !isPlantLightOn;
//     updateButtonState(plantLightToggleButton, isPlantLightOn, "💡ON", "🕯️OFF");
//     updatePlantLightVisuals();
//   }
// }

// Replace the existing plant light button code with this:

const plantLightToggleButton = document.getElementById("plantLightToggleButton");
const lightSlider = document.getElementById("lightSlider");
const lightIntensity = document.getElementById("lightIntensity");
const selector = document.getElementById("selector");
const selectValue = document.getElementById("selectValue");
const progressColor = document.getElementById("progressColor");

// Initialize slider values
selectValue.innerHTML = lightIntensity.value;
selector.style.left = lightIntensity.value + "%";
progressColor.style.width = lightIntensity.value + "%";

// Update slider when moved
lightIntensity.oninput = function() {
    selectValue.innerHTML = this.value;
    selector.style.left = this.value + "%";
    progressColor.style.width = this.value + "%";
};

// Function to fetch current light intensity from server
async function fetchLightIntensity() {
  try {
    const response = await fetch("https://valk-huone-1.onrender.com/api/light-intensity");
    const data = await response.json();
    return data.intensity || 50;
  } catch (error) {
    console.error("Error fetching light intensity:", error);
    return 50; // Default value if fetch fails
  }
}

// Function to update light intensity on server
async function updateLightIntensity(value) {
  try {
    const response = await fetch("https://valk-huone-1.onrender.com/api/light-intensity", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ intensity: value })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update light intensity');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error updating light intensity:", error);
  }
}

// Initialize slider with server value
async function initializeSlider() {
  const intensity = await fetchLightIntensity();
  lightIntensity.value = intensity;
  selectValue.innerHTML = intensity;
  selector.style.left = intensity + "%";
  progressColor.style.width = intensity + "%";
  
  // Update lights based on intensity
  updateLights(intensity);
}

// Function to update lights based on intensity
function updateLights(intensity) {
  const plantLights = [rectLight1, rectLight2, rectLight3, rectLight4, rectLight5, rectLight6];
  const normalizedIntensity = intensity / 100 * 25; // Scale to 0-25 range
  
  plantLights.forEach(light => {
    gsap.to(light, {
      intensity: normalizedIntensity,
      duration: 0.5
    });
    light.visible = intensity > 0;
  });
}

// Initialize slider when page loads
initializeSlider();

// Update slider when moved
lightIntensity.oninput = async function() {
  const value = parseInt(this.value);
  selectValue.innerHTML = value;
  selector.style.left = value + "%";
  progressColor.style.width = value + "%";
  
  // Update lights immediately for responsive UI
  updateLights(value);
  
  // Debounce server update to avoid too many requests
  if (this.debounceTimer) clearTimeout(this.debounceTimer);
  this.debounceTimer = setTimeout(() => {
    updateLightIntensity(value);
  }, 500); // Update server after 500ms of inactivity
};

// Toggle slider visibility
plantLightToggleButton.addEventListener("click", () => {
    lightSlider.classList.toggle("hidden");
    
    // Update button text based on slider visibility
    if (lightSlider.classList.contains("hidden")) {
        plantLightToggleButton.textContent = "💡👀";
    } else {
        plantLightToggleButton.textContent = "💡🙈";
    }
});

// Close slider when clicking outside
document.addEventListener('click', (event) => {
    if (!lightSlider.contains(event.target)) {
        if (event.target !== plantLightToggleButton) {
            lightSlider.classList.add("hidden");
            plantLightToggleButton.textContent = "💡👀";
        }
    }
});

async function togglePump() {
  isPumpOn = !isPumpOn;
  const newState = isPumpOn ? "ON" : "OFF";
  updateButtonState(pumpToggleButton, isPumpOn, "🌧️ON", "🌵OFF");
  updatePumpVisuals();
  
  try {
    await updateDeviceStateOnServer('pump', newState);
  } catch (err) {
    console.error("Error updating pump state:", err);
    // Revert if update fails
    isPumpOn = !isPumpOn;
    updateButtonState(pumpToggleButton, isPumpOn, "🌧️ON", "🌵OFF");
    updatePumpVisuals();
  }
}

async function updateDeviceStateOnServer(device, state) {
  const response = await fetch("https://valk-huone-1.onrender.com/api/update-device-state", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ device, state })
  });
  
  if (!response.ok) {
    throw new Error('Failed to update device state');
  }
  
  return response.json();
}

// Call fetchDeviceStates when the page loads
document.addEventListener('DOMContentLoaded', () => {
  fetchDeviceStates();
});

// Button event listeners
fanToggleButton.addEventListener("click", toggleFan);
// plantLightToggleButton.addEventListener("click", togglePlantLight);
pumpToggleButton.addEventListener("click", togglePump);

// Sound toggle
const soundToggleButton = document.getElementById("soundToggleButton");
let isSoundOn = true;
soundToggleButton.addEventListener("click", () => {
  isSoundOn = !isSoundOn;
  soundToggleButton.textContent = isSoundOn ? '🔊' : '🔇';
  video.muted = !isSoundOn;
});

// Sun/dark mode toggle
const sunToggleButton = document.getElementById('sunToggleButton');
let isBright = true;

sunToggleButton.addEventListener('click', () => {
  isBright = !isBright;
  sunToggleButton.textContent = isBright ? '🌞' : '🌚';

  // Control rectLight7 and rectLight8 (INVERSE LOGIC)
  const lightsOn = !isBright;
  const targetIntensity = lightsOn ? 5 : 0;
  gsap.to(rectLight7, {intensity: targetIntensity,duration: 1});
  gsap.to(rectLight8, {intensity: targetIntensity,duration: 1});
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
    document.getElementById('soilElectroConductivity-container'),
    document.getElementById('poreElectroConductivity-container')
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

// Chart functionality
const graphDataButton = document.getElementById("graphDataButton");
const graphDataDropdown = document.getElementById("graphDataDropdown");

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
    if (dataChart) {
        dataChart.destroy();
    }

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

    const labels = sensorHistory[dataType].map(entry => formatDateTimeForChart(new Date(entry.time)));

    dataChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${label} (${unit})`,
                data: sensorHistory[dataType].map(d => d.value),
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
                        text: 'Date and Time'
                    },
                    ticks: {
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

    chartContainer.classList.remove("hidden");
}

function formatDateTimeForChart(date) {
    const pad = (num) => num.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// Data download functionality
// Replace the current downloadToggleButton event listener and downloadData function with this:

const downloadToggleButton = document.getElementById("downloadToggleButton");
const downloadDataDropdown = document.getElementById("downloadDataDropdown");

// Toggle dropdown visibility
downloadToggleButton.addEventListener("click", () => {
    downloadDataDropdown.classList.toggle("hidden");
});

// Handle dropdown selection
downloadDataDropdown.addEventListener("change", (event) => {
    const selectedValue = event.target.value;
    if (selectedValue) {
        downloadSelectedData(selectedValue);
        downloadDataDropdown.classList.add("hidden");
    }
});

function downloadSelectedData(dataType) {
    downloadToggleButton.classList.add('saving');
    downloadToggleButton.textContent = 'Saving...';

    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-").split('.')[0] + 'Z';
    const filename = `${dataType}_data_${timestamp}.xlsx`;
    
    // Get the selected data
    const selectedData = sensorHistory[dataType];
    
    if (!selectedData || selectedData.length === 0) {
        alert('No data available for download');
        downloadToggleButton.classList.remove('saving');
        downloadToggleButton.textContent = '💾 History';
        return;
    }

    // Prepare headers based on data type
    let headers = [["Timestamp", `${getDataTypeLabel(dataType)} (${getDataUnit(dataType)})`]];
    
    // Prepare data rows
    const data = selectedData.map(entry => [
        entry.time ? formatDateTimeForExcel(new Date(entry.time)) : "",
        entry.value ?? ""
    ]);

    // Combine headers and data
    const excelData = [...headers, ...data];
    
    // Create worksheet and workbook
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${dataType} Data`);
    
    // Download the file
    XLSX.writeFile(wb, filename);

    setTimeout(() => {
        downloadToggleButton.classList.remove('saving');
        downloadToggleButton.textContent = '💾 History';
    }, 2000);
}

// Helper functions to get labels and units
function getDataTypeLabel(dataType) {
    switch(dataType) {
        case "temperature": return "Temperature";
        case "humidity": return "Humidity";
        case "moisture": return "Soil Moisture";
        case "soilEC": return "Soil EC";
        case "co2": return "CO2";
        case "atmosphericPress": return "Atmospheric Pressure";
        case "poreEC": return "Pore EC";
        default: return dataType;
    }
}

function getDataUnit(dataType) {
    switch(dataType) {
        case "temperature": return "°C";
        case "humidity": 
        case "moisture": return "%";
        case "soilEC": 
        case "poreEC": return "mS/cm";
        case "co2": return "ppm";
        case "atmosphericPress": return "hPa";
        default: return "";
    }
}

function formatDateTimeForExcel(date) {
    const pad = num => num.toString().padStart(2, '0');
    
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
           `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}


// Camera functionality
const cameraToggleButton = document.getElementById("cameraToggleButton");
const cameraModal = document.createElement('div');
cameraModal.className = 'modal hidden';
cameraModal.innerHTML = `
  <div class="modal-wrapper">
    <div class="modal-header">
      <h1 class="modal-title">Thermal Camera View</h1>
      <button class="modal-exit-button">Exit</button>
    </div>
    <div class="modal-content">
      <div class="camera-container">
        <img id="camera-image" style="max-width: 100%;" />
        <div class="camera-info">
          <p>Time: <span id="camera-timestamp">${new Date().toLocaleString()}</span></p>
          <p>Temperature: <span id="camera-temperature"></span> °C</p>
          <p>Humidity: <span id="camera-humidity"></span> %</p>
        </div>
      </div>
    </div>
  </div>
`;
document.body.appendChild(cameraModal);

function formatCurrentTime() {
  const now = new Date();
  return now.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

cameraToggleButton.addEventListener("click", async () => {
  try {
    document.getElementById('camera-timestamp').textContent = formatCurrentTime();
    
    cameraToggleButton.classList.add('loading');
    cameraToggleButton.textContent = 'Loading...';
    
    const response = await fetch("https://valk-huone-1.onrender.com/api/data");
    const data = await response.json();
    
    if (data.lastCameraShot && data.lastCameraShot.imageUrl) {
      document.getElementById('camera-image').src = data.lastCameraShot.imageUrl;
      
      if (data.sensor1 && data.sensor1.readings) {
        const tempReading = data.sensor1.readings.find(r => r.metric === "1");
        const humidReading = data.sensor1.readings.find(r => r.metric === "2");
        
        if (tempReading) {
          document.getElementById('camera-temperature').textContent = 
            parseFloat(tempReading.value).toFixed(1);
        }
        if (humidReading) {
          document.getElementById('camera-humidity').textContent = 
            parseFloat(humidReading.value).toFixed(1);
        }
      }
      
      cameraModal.classList.remove('hidden');
    } else {
      alert('No camera image available');
    }
  } catch (error) {
    console.error('Error fetching camera image:', error);
    alert('Failed to load camera image');
  } finally {
    cameraToggleButton.classList.remove('loading');
    cameraToggleButton.textContent = '🔥 Camera';
  }
});

cameraModal.querySelector('.modal-exit-button').addEventListener('click', () => {
  cameraModal.classList.add('hidden');
});

// Add this near your other button declarations (around line 1200)
const hideShowToggleButton = document.getElementById("hide-showToggleButton");
const dataContainers = [
    document.getElementById('vantaa-date-container'),
    document.getElementById('vantaa-time-container'),
    document.getElementById('temperature-container'),
    document.getElementById('humidity-container'),
    document.getElementById('co2-container'),
    document.getElementById('atmosphericPress-container'),
    document.getElementById('moisture-container'),
    document.getElementById('soilElectroConductivity-container'),
    document.getElementById('poreElectroConductivity-container')
];

const controlButtons = [
  fanToggleButton,
  pumpToggleButton,
  plantLightToggleButton,
  soundToggleButton,
  sunToggleButton,
  cameraToggleButton,
  graphDataButton,
  downloadToggleButton
];

let isDataVisible = true;

hideShowToggleButton.addEventListener("click", () => {
    isDataVisible = !isDataVisible;
    
    // Update toggle button text
    hideShowToggleButton.textContent = isDataVisible ? '🙈 Hide' : '👀 Show';

    // Toggle data containers
    dataContainers.forEach(container => {
        if (container) {
            container.style.display = isDataVisible ? 'block' : 'none';
        }
    });

    // Toggle control buttons (only on mobile)
    if (window.innerWidth <= 768) { // You can adjust the width threshold
        controlButtons.forEach(button => {
            if (button) {
                button.style.display = isDataVisible ? 'inline-block' : 'none';
            }
        });
    }
});

const automateToggleButton = document.getElementById("automateToggleButton");
let isAutomated = false;

automateToggleButton.addEventListener("click", () => {
    isAutomated = !isAutomated;
    
    // Update button text
    automateToggleButton.textContent = isAutomated ? '👆 Manual' : '🤖 Automate';

    // Toggle control button visibility
    pumpToggleButton.style.display = isAutomated ? 'none' : 'inline-block';

    // Here you would add your automation logic
    if (isAutomated) {
        startAutomation();
    } else {
        stopAutomation();
    }
});

enterButton.addEventListener("click", () => {
    gsap.to(loadingScreen, {
        opacity: 0,
        duration: 1,
        onComplete: () => {
            loadingScreen.remove();
            document.getElementById("mainContent").style.display = "block";

            // Start growth animation after 500 milliseconds
            setTimeout(() => {
                animateObjectsGrowth();
            }, 500);
        },
    });
    video.muted = false;
    video.volume = 0.2;
    video.play();
});