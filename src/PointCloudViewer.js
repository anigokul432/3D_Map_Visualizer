// src/PointCloudViewer.js

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PCDLoader } from 'three/examples/jsm/loaders/PCDLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const PointCloudViewer = ({ view, isAnnotationActive }) => {
  const mountRef = useRef(null);
  const controlsRef = useRef(null);
  const [cameraState, setCameraState] = useState(null);
  const [scene, setScene] = useState(null);
  const [camera, setCamera] = useState(null);
  const [annotations, setAnnotations] = useState([]);

  useEffect(() => {
    const mount = mountRef.current;

    // Scene, camera, renderer
    const scene = new THREE.Scene();
    setScene(scene);
    let camera;
    const aspect = mount.clientWidth / mount.clientHeight;

    if (view === 'Free') {
      camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
      camera.position.set(0, 0, 5);
    } else {
      camera = new THREE.OrthographicCamera(-aspect * 10, aspect * 10, 10, -10, 0.1, 1000);
    }
    setCamera(camera);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    if (cameraState) {
      camera.position.copy(cameraState.position);
      camera.rotation.copy(cameraState.rotation);
      if (camera.isOrthographicCamera) {
        camera.zoom = cameraState.zoom;
        camera.updateProjectionMatrix();
      }
    }

    if (view !== 'Free' || isAnnotationActive) {
      controls.enableRotate = false;
    }
    if (isAnnotationActive) {
      controls.enablePan = false;
      controls.enableZoom = false;
    }

    // Add light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5).normalize();
    scene.add(light);

    // Load PCD file
    const loader = new PCDLoader();
    loader.load(
      `${process.env.PUBLIC_URL}/sample_pcd/bunny.pcd`,
      (points) => {
        scene.add(points);
        animate();
      },
      undefined,
      (error) => {
        console.error('Error loading PCD file:', error);
      }
    );

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    // Handle window resize
    const handleResize = () => {
      const aspect = mount.clientWidth / mount.clientHeight;
      if (camera.isPerspectiveCamera) {
        camera.aspect = aspect;
      } else {
        camera.left = -aspect * 10;
        camera.right = aspect * 10;
        camera.top = 10;
        camera.bottom = -10;
      }
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      mount.removeChild(renderer.domElement);
    };
  }, [view]);

  useEffect(() => {
    const camera = controlsRef.current.object;
    if (isAnnotationActive) {
      setCameraState({
        position: camera.position.clone(),
        rotation: camera.rotation.clone(),
        zoom: camera.zoom,
      });
      controlsRef.current.enableRotate = false;
      controlsRef.current.enablePan = false;
      controlsRef.current.enableZoom = false;
    } else if (cameraState) {
      camera.position.copy(cameraState.position);
      camera.rotation.copy(cameraState.rotation);
      if (camera.isOrthographicCamera) {
        camera.zoom = cameraState.zoom;
        camera.updateProjectionMatrix();
      }
      controlsRef.current.enableRotate = true;
      controlsRef.current.enablePan = true;
      controlsRef.current.enableZoom = true;
    }
  }, [isAnnotationActive]);

  useEffect(() => {
    const camera = controlsRef.current.object;

    if (view !== 'Free') {
      switch (view) {
        case 'XY':
          camera.position.set(0, 0, 10);
          camera.lookAt(0, 0, 0);
          break;
        case 'XZ':
          camera.position.set(0, 10, 0);
          camera.lookAt(0, 0, 0);
          break;
        case 'YZ':
          camera.position.set(10, 0, 0);
          camera.lookAt(0, 0, 0);
          break;
        default:
          break;
      }
      if (camera.isOrthographicCamera) {
        camera.updateProjectionMatrix();
      }
    }

    // Add existing annotations to the new scene
    annotations.forEach((annotation) => {
      scene.add(annotation);
    });

  }, [view, annotations, scene]);

  const handleMouseClick = (event) => {
    if (!isAnnotationActive || !camera || !scene) return;

    const rect = mountRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const points = scene.children.find(child => child.isPoints);
    if (points) {
      const intersect = getClosestPoint(raycaster, points, 0.1); // Increased radius to 0.1
      if (intersect) {
        console.log(intersect.point);

        const sphereGeometry = new THREE.SphereGeometry(0.1, 32, 32);
        const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.copy(intersect.point);
        scene.add(sphere);

        setAnnotations([...annotations, sphere]); // Store annotation
      }
    }
  };

  const getClosestPoint = (raycaster, points, radius) => {
    const geometry = points.geometry;
    const positions = geometry.attributes.position.array;
    const matrixWorld = points.matrixWorld;

    let closestPoint = null;
    let closestDistance = Infinity;

    for (let i = 0; i < positions.length; i += 3) {
      const point = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
      point.applyMatrix4(matrixWorld);

      const distance = raycaster.ray.distanceToPoint(point);
      if (distance < closestDistance && distance < radius) {
        closestPoint = point;
        closestDistance = distance;
      }
    }

    if (closestPoint) {
      return { point: closestPoint };
    } else {
      return null;
    }
  };

  useEffect(() => {
    if (isAnnotationActive) {
      mountRef.current.addEventListener('click', handleMouseClick);
    } else {
      mountRef.current.removeEventListener('click', handleMouseClick);
    }

    return () => {
      mountRef.current.removeEventListener('click', handleMouseClick);
    };
  }, [isAnnotationActive, annotations]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};

export default PointCloudViewer;
