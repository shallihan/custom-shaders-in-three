import React, { useState } from "react";
import * as THREE from "three";
import styled from "styled-components";
import { Canvas, useFrame } from "@react-three/fiber";
import "../fonts/fonts.css";
import GlobalStyles from "../styles";
import { fragment, vertex } from "../shaders";

const cloths = [
  { title: "Print #1", src: "/image1.jpg", theme: "" },
  { title: "Print #2", src: "/image2.jpg", theme: "" },
  { title: "Print #3", src: "/image3.jpg", theme: "cream" },
  { title: "Print #4", src: "/image4.jpg", theme: "dark" },
  { title: "Print #5", src: "/image5.jpg", theme: "dark" },
];

const arc = (Math.PI * 2) / cloths.length;

const Model = ({ cloth, selectedClothFromCanvas, rotation }) => {
  const loader = new THREE.TextureLoader();
  const clock = new THREE.Clock();
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const uniforms = {
    image: { value: loader.load(cloth.src) },
    time: { value: clock.getElapsedTime() },
    mouse: { value: mouse },
    touchUv: { value: new THREE.Vector2(0.5, 0.5) },
    touchStrength: { value: 0 },
    touchStrengthAim: { value: 0 },
  };

  const dpi = 50;

  const endEntryPosition = new THREE.Vector3(0, 0, 0);

  useFrame((state) => {
    raycaster.setFromCamera(mouse, state.camera);

    uniforms.time = { value: clock.getElapsedTime() };
    uniforms.mouse = { value: mouse };

    const currentStrength = uniforms.touchStrength.value;
    const aimStrength = uniforms.touchStrengthAim.value;
    const diffStrength = (aimStrength - currentStrength) * 0.025;

    uniforms.touchStrength = { value: currentStrength + diffStrength };

    state.camera.position.lerp(endEntryPosition, 0.005);

    state.camera.quaternion.slerp(
      state.scene.children[selectedClothFromCanvas].quaternion,
      0.005
    );

    state.camera.quaternion.normalize();

    state.camera.updateProjectionMatrix();
  });

  return (
    <group rotation={rotation}>
      <mesh position={[0, 0, -10]}>
        <planeBufferGeometry attach="geometry" args={[4, 6, dpi, dpi * 1.5]} />
        <shaderMaterial
          attach="material"
          args={[
            {
              uniforms: uniforms,
              vertexShader: vertex,
              fragmentShader: fragment,
            },
          ]}
        />
      </mesh>
    </group>
  );
};

const WithReactThreeFiber = () => {
  const [selectedCloth, setSelectedCloth] = useState(0);
  // The list of 3D objects in the canvas are listed backwards, instead of 0 1 2 3 4 it's now 0 4 3 2 1
  // To account for this another piece of state to get things moving in the right direction
  const [selectedClothFromCanvas, setSelectedClothFromCanvas] = useState(0);

  const handleNextArrowClick = (event) => {
    event.preventDefault();
    if (selectedClothFromCanvas === 0) {
      setSelectedClothFromCanvas(cloths.length - 1);
    } else if (selectedClothFromCanvas === 1) {
      setSelectedClothFromCanvas(0);
    } else {
      setSelectedClothFromCanvas(selectedClothFromCanvas - 1);
    }

    if (selectedCloth === cloths.length - 1) {
      setSelectedCloth(0);
    } else {
      setSelectedCloth(selectedCloth + 1);
    }
  };

  const handlePreviousArrowClick = (event) => {
    event.preventDefault();
    if (selectedClothFromCanvas === 0) {
      setSelectedClothFromCanvas(1);
    } else if (selectedClothFromCanvas === cloths.length - 1) {
      setSelectedClothFromCanvas(0);
    } else {
      setSelectedClothFromCanvas(selectedClothFromCanvas + 1);
    }

    if (selectedCloth === 0) {
      setSelectedCloth(cloths.length - 1);
    } else {
      setSelectedCloth(selectedCloth - 1);
    }
  };

  return (
    <>
      <GlobalStyles theme={cloths[selectedCloth].theme} />
      <Container>
        <Header>
          <h1>Cloth Studios</h1>
          <div>{cloths[selectedCloth].title}</div>
          <Navigation>
            <button type="button" onClick={handlePreviousArrowClick}>
              &#8592;
            </button>
            <button type="button" onClick={handleNextArrowClick}>
              &#8594;
            </button>
          </Navigation>
        </Header>
        <CanvasSection>
          <Canvas
            camera={{
              fov: 50,
              near: 0.1,
              far: 1000,
              position: [0, Math.PI / -4, 0],
            }}
          >
            {cloths.map((cloth, index) => (
              <Model
                cloth={cloth}
                index={index}
                selectedClothFromCanvas={selectedClothFromCanvas}
                rotation={[0, index * arc, 0]}
              />
            ))}
          </Canvas>
        </CanvasSection>
      </Container>
    </>
  );
};

const Container = styled.main`
  position: relative;
  font-family: Porpora;
  font-size: 24px;
  line-height: 1;
  background-color: var(--background);
  background-image: linear-gradient(transparent 50%, rgba(0, 0, 0, 0.25));
  color: var(--highlight);
  transition: background-color 0.5s, color 0.5s;
  height: 100vh;
  width: 100vw;
`;

const Header = styled.header`
  position: fixed;
  top: 24px;
  left: 24px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 10;
  h1,
  div,
  nav button {
    padding: 8px 12px;
    text-align: center;
    background-color: var(--highlight);
    color: var(--background);
    border: 2px solid var(--highlight);
    margin: 0 0 2px 0;
    transition: background-color 0.2s, color 0.2s;
  }
  h1 {
    animation: startanim 1s 1.5s both;
  }

  div {
    animation: startanim 1.25s 1.75s both;
  }

  nav {
    animation: startanim 1.5s 2s both;
  }
`;

const Navigation = styled.nav`
  display: flex;
  gap: 2px;
  button {
    flex: 1;
    margin-right: 2px;
    text-decoration: none;
    transition: background-color 0.2s, color 0.2s;
  }
  button:hover {
    background-color: transparent;
    color: var(--highlight);
  }
`;

const CanvasSection = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  pointer-events: none;
  img {
    max-height: 75vh;
  }
  canvas {
    height: 100vh !important;
  }
`;

export default WithReactThreeFiber;
