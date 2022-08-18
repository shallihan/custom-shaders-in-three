import React, { useEffect } from "react";
import * as THREE from "three";
import styled from "styled-components";
import GlobalStyles from "../styles";
import "../fonts/fonts.css";
import { fragment, vertex } from "../shaders";

const cloths = [
  { title: "Print #1", src: "/image1.jpg", theme: "" },
  { title: "Print #2", src: "/image2.jpg", theme: "" },
  { title: "Print #3", src: "/image3.jpg", theme: "cream" },
  { title: "Print #4", src: "/image4.jpg", theme: "dark" },
  { title: "Print #5", src: "/image5.jpg", theme: "dark" },
];

const IndexPage = () => {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  const scene = new THREE.Scene();
  if (window !== undefined) {
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
  }
  const loader = new THREE.TextureLoader();
  const clock = new THREE.Clock();
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const arc = (Math.PI * 2) / cloths.length;

  cloths.forEach((cloth, index) => {
    cloth.uniforms = {
      image: { value: loader.load(cloth.src) },
      time: { value: clock.getElapsedTime() },
      mouse: { value: mouse },
      touchUv: { value: new THREE.Vector2(0.5, 0.5) },
      touchStrength: { value: 0 },
      touchStrengthAim: { value: 0 },
    };

    const dpi = 50;
    const geometry = new THREE.PlaneGeometry(4, 6, dpi, dpi * 1.5);
    const material = new THREE.ShaderMaterial({
      uniforms: cloth.uniforms,
      vertexShader: vertex,
      fragmentShader: fragment,
    });
    const shape = new THREE.Mesh(geometry, material);

    const group = new THREE.Group();
    group.rotation.set(0, index * arc, 0);

    shape.position.set(0, 0, -10);

    cloth.shape = shape;

    group.add(shape);
    scene.add(group);
  });

  let current = 0;
  let aimRotationY = 0;
  let currentRotationX = Math.PI / 4;
  let aimRotationX = 0;
  let currentRotationY = 0;

  const animate = () => {
    const diffX = (aimRotationX - currentRotationX) * 0.0125;
    currentRotationX += diffX;

    const diffY = (aimRotationY - currentRotationY) * 0.025;
    currentRotationY += diffY;

    camera.rotation.set(currentRotationX, currentRotationY, 0);

    raycaster.setFromCamera(mouse, camera);

    cloths.forEach((cloth) => {
      cloth.uniforms.time = { value: clock.getElapsedTime() };
      cloth.uniforms.mouse = { value: mouse };

      const intersects = raycaster.intersectObject(cloth.shape);
      if (intersects.length > 0) {
        cloth.uniforms.touchUv = { value: intersects[0].uv };
        cloth.uniforms.touchStrengthAim = { value: 1 };
      } else {
        cloth.uniforms.touchStrengthAim = { value: 0 };
      }

      const currentStrength = cloth.uniforms.touchStrength.value;
      const aimStrength = cloth.uniforms.touchStrengthAim.value;
      const diffStrength = (aimStrength - currentStrength) * 0.025;

      cloth.uniforms.touchStrength = {
        value: currentStrength + diffStrength,
      };
    });

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };

  let title;

  useEffect(() => {
    const section = document.querySelector("section");
    title = document.querySelector("header div");

    renderer.setClearColor(0xff0000, 0);
    renderer.setSize(section.clientWidth, section.clientHeight);
    section.appendChild(renderer.domElement);

    section.addEventListener("mousemove", (event) => {
      mouse.x = (event.clientX / section.clientWidth) * 2 - 1;
      mouse.y = (event.clientY / section.clientHeight) * -2 + 1;
    });
    
    window.addEventListener("resize", () => {
      camera.aspect = section.clientWidth / section.clientHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(section.clientWidth, section.clientHeight);
    });
  }, []);

  const handleNextArrowClick = (event) => {
    event.preventDefault();
    current += 1;
    aimRotationY -= arc;
    if (current > cloths.length - 1) {
      current = 0;
      if (title?.innerHTML) {
        title.innerHTML = cloths[0].title;
      }
    }
    if (title?.innerHTML) {
      title.innerHTML = cloths[current].title;
    }
  };

  const handlePreviousArrowClick = (event) => {
    event.preventDefault();
    current -= 1;
    aimRotationY += arc;
    if (current < 0) {
      current = cloths.length - 1;
      if (title?.innerHTML) {
        title.innerHTML = cloths[cloths.length - 1].title;
      }
    }
    if (title?.innerHTML) {
      title.innerHTML = cloths[current].title;
    }
  };

  animate();

  return (
    <>
      <GlobalStyles theme={cloths[current].theme} />
      <Container>
        <Header>
          <h1>Cloth Studios</h1>
          <div>{cloths[current].title}</div>
          <Navigation>
            <button type="button" onClick={handlePreviousArrowClick}>
              &#8592;
            </button>
            <button type="button" onClick={handleNextArrowClick}>
              &#8594;
            </button>
          </Navigation>
        </Header>
        <CanvasSection />
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
  img {
    max-height: 75vh;
  }
`;

export default IndexPage;
