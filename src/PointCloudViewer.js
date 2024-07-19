// src/PointCloudViewer.js

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PCDLoader } from 'three/examples/jsm/loaders/PCDLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './PointCloudViewer.css'; // Import the CSS file

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
    const aspect = mount.clientWidth / mount.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    camera.position.set(0, 0, 5);
    setCamera(camera);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

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
      updateAnnotationsPosition();
    };

    // Handle window resize
    const handleResize = () => {
      const aspect = mount.clientWidth / mount.clientHeight;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      mount.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    const camera = controlsRef.current.object;

    switch (view) {
      case 'Free':
        camera.fov = 75;
        camera.position.set(0, 0, 5);
        camera.lookAt(0, 0, 0);
        controlsRef.current.enableRotate = true;
        controlsRef.current.enablePan = true;
        controlsRef.current.enableZoom = true;
        break;
      case 'XY':
        camera.fov = 1;
        camera.position.set(0, 0, 200);
        camera.lookAt(0, 0, 0);
        controlsRef.current.enableRotate = false;
        controlsRef.current.enablePan = true;
        controlsRef.current.enableZoom = true;
        break;
      case 'XZ':
        camera.fov = 1;
        camera.position.set(0, 200, 0);
        camera.lookAt(0, 0, 0);
        controlsRef.current.enableRotate = false;
        controlsRef.current.enablePan = true;
        controlsRef.current.enableZoom = true;
        break;
      case 'YZ':
        camera.fov = 1;
        camera.position.set(200, 0, 0);
        camera.lookAt(0, 0, 0);
        controlsRef.current.enableRotate = false;
        controlsRef.current.enablePan = true;
        controlsRef.current.enableZoom = true;
        break;
      default:
        break;
    }

    camera.updateProjectionMatrix();
    updateAnnotationsPosition();
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
    const handleUpdate = () => {
      updateAnnotationsPosition();
    };

    // Update annotations position on controls update
    controlsRef.current.addEventListener('change', handleUpdate);

    return () => {
      controlsRef.current.removeEventListener('change', handleUpdate);
    };
  }, [annotations]);

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
        console.log('Intersection point:', intersect.point);

        const annotation = {
          point: intersect.point
        };

        setAnnotations((prevAnnotations) => {
          const newAnnotations = [...prevAnnotations, annotation];
          setTimeout(() => updateAnnotationsPosition(newAnnotations), 0); // Update positions immediately after state update
          return newAnnotations;
        }); // Store annotation
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

  const updateAnnotationsPosition = (annotationsToUpdate = annotations) => {
    annotationsToUpdate.forEach((annotation, index) => {
      const vector = new THREE.Vector3(annotation.point.x, annotation.point.y, annotation.point.z);
      vector.project(camera);

      const x = (vector.x * 0.5 + 0.5) * mountRef.current.clientWidth;
      const y = (vector.y * -0.5 + 0.5) * mountRef.current.clientHeight;

      const element = document.getElementById(`annotation-${index}`);
      if (element) {
        if (view !== 'Free') {
          element.style.display = 'none';
        } else if (
          vector.x >= -1 && vector.x <= 1 &&
          vector.y >= -1 && vector.y <= 1 &&
          vector.z >= -1 && vector.z <= 1
        ) {
          element.style.display = 'block';
          element.style.left = `${x - 50}px`; // Adjust to position bottom-left
          element.style.top = `${y - 50}px`;  // Adjust to position bottom-left
        } else {
          element.style.display = 'none';
        }
      }
    });
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

  return (
    <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {annotations.map((annotation, index) => (
        <div
          key={index}
          id={`annotation-${index}`}
          className="annotation"
        />
      ))}
    </div>
  );
};

export default PointCloudViewer;
