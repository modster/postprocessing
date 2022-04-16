import {
	Color,
	PerspectiveCamera,
	Scene,
	sRGBEncoding,
	VSMShadowMap,
	WebGLRenderer
} from "three";

import {
	EffectComposer,
	EffectPass,
	NoiseEffect,
	RenderPass,
	SMAAEffect,
	VignetteEffect
} from "postprocessing";

import { ControlMode, SpatialControls } from "spatial-controls";
import * as CornellBox from "./CornellBox.js";

/**
 * Creates the scene.
 *
 * @param {Map} assets - Preloaded scene assets.
 */

export function initialize(assets) {

	// Renderer

	const renderer = new WebGLRenderer({
		powerPreference: "high-performance",
		antialias: false,
		stencil: false,
		depth: false
	});

	const bgColor = new Color(0x151515);
	renderer.setClearColor(bgColor.convertSRGBToLinear());
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.physicallyCorrectLights = true;
	renderer.outputEncoding = sRGBEncoding;
	renderer.shadowMap.type = VSMShadowMap;
	renderer.shadowMap.autoUpdate = false;
	renderer.shadowMap.needsUpdate = true;
	renderer.shadowMap.enabled = true;
	document.body.append(renderer.domElement);

	// Scene, Camera and Controls

	const scene = new Scene();
	const camera = new PerspectiveCamera(59, 1, 0.3, 1000);
	const { position, quaternion } = camera;
	const controls = new SpatialControls(position, quaternion, renderer.domElement);
	const settings = controls.settings;
	settings.general.setMode(ControlMode.THIRD_PERSON);
	settings.translation.setEnabled(false);
	settings.rotation.setSensitivity(2.2);
	settings.rotation.setDamping(0.05);
	settings.zoom.setSensitivity(0.25);
	settings.zoom.setDamping(0.1);
	settings.zoom.setRange(1.0, 10.0);
	controls.setPosition(0, 0, 4);

	// Lights & Objects

	scene.add(CornellBox.createLights());
	scene.add(CornellBox.createEnvironment());
	scene.add(CornellBox.createActors());

	// Post Processing

	const smaaEffect = new SMAAEffect(assets.get("smaa-search"), assets.get("smaa-area"));
	const noiseEffect = new NoiseEffect({ premultiply: true });
	const vignetteEffect = new VignetteEffect();

	smaaEffect.edgeDetectionMaterial.edgeDetectionThreshold = 0.05;
	noiseEffect.blendMode.opacity.value = 0.75;

	const renderPass = new RenderPass(scene, camera);
	const effectPass = new EffectPass(camera, noiseEffect, vignetteEffect, smaaEffect);

	const composer = new EffectComposer(renderer);
	composer.addPass(renderPass);
	composer.addPass(effectPass);

	// Resizing

	function onResize(event) {

		const width = window.innerWidth;
		const height = window.innerHeight;
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		composer.setSize(width, height);

	}

	window.addEventListener("resize", onResize);
	onResize();

	// Render Loop

	requestAnimationFrame(function render(timestamp) {

		requestAnimationFrame(render);
		controls.update(timestamp);
		composer.render();

	});

}
