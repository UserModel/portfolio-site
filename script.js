// Keybinds
let rightForwardPressed = false;
let rightBackwardPressed = false;
let leftForwardPressed = false;
let leftBackwardPressed = false;

const rightForwardKey = 'i';
const rightBackwardKey = 'k';
const leftForwardKey = 'w';
const leftBackwardKey = 's';

keyboardJS.bind(
	rightForwardKey,
	function (e) {
		rightForwardPressed = true;
	},
	function (e) {
		rightForwardPressed = false;
	}
);
keyboardJS.bind(
	rightBackwardKey,
	function (e) {
		rightBackwardPressed = true;
	},
	function (e) {
		rightBackwardPressed = false;
	}
);
keyboardJS.bind(
	leftForwardKey,
	function (e) {
		leftForwardPressed = true;
	},
	function (e) {
		leftForwardPressed = false;
	}
);
keyboardJS.bind(
	leftBackwardKey,
	function (e) {
		leftBackwardPressed = true;
	},
	function (e) {
		leftBackwardPressed = false;
	}
);

const playerForwardVelocityChange = 0.4;
const playerBackwardVelocityChange = 0.2;
const playerTurnSpeed = 0.05;
const frictionSlowingRate = 0.05;
const ballSize = 2;
const playerDistanceFromBall = ballSize + 0.5;
const velocityMax = 15;
let playerAngleFromBall = 0;
let rotationAmount = 0;
var ballCircumference = Math.PI * ballSize * 2;

var world = new CANNON.World();
world.gravity.set(0, 0, 0);
world.broadphase = new CANNON.NaiveBroadphase();

var sphereShape = new CANNON.Sphere(ballSize);
var sphereBody = new CANNON.Body({
	mass: 10,
	position: new CANNON.Vec3(0, 0, 10),
	shape: sphereShape,
});
world.addBody(sphereBody);

// Create Three.js scene and camera
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(
	50,
	window.innerWidth / window.innerHeight,
	1,
	1000
);
camera.position.z = 50;

// WEBGL Renderer
var renderer = new THREE.WebGLRenderer({
	antialias: true,
	powerPreference: 'high-performance',
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// Ball Sphere
var sphereGeometry = new THREE.SphereGeometry(sphereShape.radius, 32, 32);
const texture = new THREE.TextureLoader().load(
	'https://miro.medium.com/max/1400/0*0Tp7OEkNcR-A59NV'
);
var sphereMaterial = new THREE.MeshBasicMaterial({ map: texture });
var sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphereMesh.position.copy(sphereBody.position);
scene.add(sphereMesh);

// Ground
var geometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
const groundTexture = new THREE.TextureLoader().load(
	'https://media.istockphoto.com/id/865924416/vector/cartoon-grass.jpg?s=612x612&w=0&k=20&c=fwF4vmEDWJEDMce3WbLQTHTxfuOVylyFsBC3PqqGnbo='
);
groundTexture.wrapS = THREE.RepeatWrapping;
groundTexture.wrapT = THREE.RepeatWrapping;
groundTexture.repeat.set(100, 100);
var material = new THREE.MeshBasicMaterial({ map: groundTexture });
var floor = new THREE.Mesh(geometry, material);
floor.material.side = THREE.DoubleSide;
floor.rotation.x = (90 * Math.PI) / 2;
scene.add(floor);

// Player Body
var playerSphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
var playerSphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
var playerSphereMesh = new THREE.Mesh(
	playerSphereGeometry,
	playerSphereMaterial
);
playerSphereMesh.position.x = 0;
playerSphereMesh.position.y = sphereMesh.position.y - playerDistanceFromBall;
playerSphereMesh.position.z = sphereMesh.position.z;
scene.add(playerSphereMesh);

function resizeCanvasToDisplaySize() {
	const canvas = renderer.domElement;
	// look up the size the canvas is being displayed
	const width = window.innerWidth;
	const height = window.innerHeight;

	// adjust displayBuffer size to match
	if (canvas.width !== width || canvas.height !== height) {
		renderer.setSize(width, height, true);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	}
}

// Render Function
var clock = new THREE.Clock();
function render() {
	resizeCanvasToDisplaySize();
	requestAnimationFrame(render);
	// Updating Physics Close
	var dt = clock.getDelta();
	world.step(dt);

	// Velocity Physics
	if (
		(rightForwardPressed && leftForwardPressed) ||
		(rightBackwardPressed && leftBackwardPressed)
	) {
		const newXVelocityDelta =
			Math.cos(playerAngleFromBall) * playerForwardVelocityChange;
		const newYVelocityDelta =
			Math.sin(playerAngleFromBall) * playerForwardVelocityChange;
		if (rightForwardPressed && leftForwardPressed) {
			sphereBody.velocity.y -= newYVelocityDelta;
			sphereBody.velocity.x -= newXVelocityDelta;
		} else {
			sphereBody.velocity.y += newYVelocityDelta / 2;
			sphereBody.velocity.x += newXVelocityDelta / 2;
		}
		const magnitude = Math.sqrt(
			Math.pow(sphereBody.velocity.x, 2) + Math.pow(sphereBody.velocity.y, 2)
		);
		if (magnitude > velocityMax) {
			let ratio = velocityMax / magnitude;
			sphereBody.velocity.x *= ratio;
			sphereBody.velocity.y *= ratio;
		}
	} else if (rightForwardPressed) {
		if (leftBackwardPressed) {
			playerAngleFromBall += playerTurnSpeed;
		} else {
			playerAngleFromBall += playerTurnSpeed / 2;
		}
	} else if (leftForwardPressed) {
		if (rightBackwardPressed) {
			playerAngleFromBall -= playerTurnSpeed;
		} else {
			playerAngleFromBall -= playerTurnSpeed / 2;
		}
	} else if (rightBackwardPressed) {
		playerAngleFromBall -= playerTurnSpeed / 2;
	} else if (leftBackwardPressed) {
		playerAngleFromBall += playerTurnSpeed / 2;
	}

	if (
		!(rightForwardPressed && leftForwardPressed) &&
		!(rightBackwardPressed && leftBackwardPressed)
	) {
		if (sphereBody.velocity.x < 0.00001 && sphereBody.velocity.x > -0.00001) {
			sphereBody.velocity.x = 0;
		}
		if (sphereBody.velocity.y < 0.00001 && sphereBody.velocity.y > -0.00001) {
			sphereBody.velocity.y = 0;
		}
		if (
			sphereBody.velocity.x > 0.01 ||
			sphereBody.velocity.x < -0.01 ||
			sphereBody.velocity.y > 0.01 ||
			sphereBody.velocity.y < -0.01
		) {
			sphereBody.velocity.x = sphereBody.velocity.x * (1 - frictionSlowingRate);
			sphereBody.velocity.y = sphereBody.velocity.y * (1 - frictionSlowingRate);
		}
	}

	var ballRotationAxis = new THREE.Vector3(
		Math.cos(playerAngleFromBall - Math.PI / 2),
		Math.sin(playerAngleFromBall - Math.PI / 2),
		0
	);
	ballRotationAxis.normalize();
	var ballVelocity = new THREE.Vector3(
		sphereBody.velocity.x,
		sphereBody.velocity.y,
		0
	);
	rotationAmount += ballVelocity.length() / (Math.PI * 10);
	sphereBody.quaternion.setFromAxisAngle(ballRotationAxis, rotationAmount);
	// Problem: Axis based on perpendicular to player, which means if the player is moving in a different direction than the velocity, the texture messes up
	// Problem: Due to the rotationAmount being saved and the axis being dependent on player angle, the texture will mess up when the ball doesnt move but the player does

	console.log(ballVelocity.length());

	// Keeping physics object in the same position as the mesh
	sphereMesh.position.copy(sphereBody.position);
	sphereMesh.quaternion.copy(sphereBody.quaternion);

	camera.position.lerp(
		new THREE.Vector3(
			sphereBody.position.x,
			sphereBody.position.y,
			camera.position.z
		),
		0.1
	);
	camera.rotation.z = playerAngleFromBall + 1 * Math.PI + (Math.PI * 3) / 2;

	// Keeping player in the same position as the ball
	playerSphereMesh.position.x =
		sphereBody.position.x +
		Math.cos(playerAngleFromBall) * playerDistanceFromBall;
	playerSphereMesh.position.y =
		sphereBody.position.y +
		Math.sin(playerAngleFromBall) * playerDistanceFromBall;

	renderer.render(scene, camera);
}
render();
