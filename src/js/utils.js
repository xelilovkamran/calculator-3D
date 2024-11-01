import * as THREE from "three";
import { gsap } from "gsap";

export const playSound = (sound) => {
  sound.currentTime = 0;
  sound.play();
};

export const clearScene = (group) => {
  while (group.children.length) {
    const object = group.children[0];
    object.geometry.dispose();
    object.material.dispose();
    group.remove(object);
  }
};

export const renderDisplay = (expression, displayGroup, numbers) => {
  let width = -0.5;

  clearScene(displayGroup);

  expression.split("").forEach((char, i) => {
    if (char === " ") return;
    const numberMesh = numbers[char].clone();

    const size = new THREE.Vector3();
    const numberWidth = new THREE.Box3()
      .setFromObject(numberMesh)
      .getSize(size).x;

    numberMesh.position.x = width + numberWidth / 2 + 0.1;
    numberMesh.position.y = 0.5;
    numberMesh.position.z = 0.05;

    width += numberWidth / 2 + 0.1;

    displayGroup.add(numberMesh);
  });
};

export const handleCalculator = (
  selectedButton,
  expression,
  calculatorParts
) => {
  const button = calculatorParts.find(
    (part) => part.userData.name === selectedButton
  );

  gsap.to(button?.position, { z: -0.05, duration: 0.1 });
  gsap.to(button?.position, { z: 0, duration: 0.1, delay: 0.1 });

  if (
    selectedButton === "." &&
    expression
      .split(/[\+\-\*\/\%]/)
      .at(-1)
      .includes(".")
  ) {
    return expression;
  }

  if (expression.length === 0 && selectedButton === ".") {
    return (expression = "0.");
  }

  if (
    !expression.length &&
    (selectedButton === "+" ||
      selectedButton === "-" ||
      selectedButton === "*" ||
      selectedButton === "/" ||
      selectedButton === "%")
  ) {
    return "0";
  }

  if (expression === "0" && !isNaN(selectedButton)) {
    return (expression = "");
  }

  if (
    (selectedButton === "+" ||
      selectedButton === "-" ||
      selectedButton === "*" ||
      selectedButton === "%" ||
      selectedButton === "/") &&
    isNaN(expression[expression.length - 1])
  ) {
    return expression.split("").slice(0, -1).join("") + selectedButton;
  }

  if (selectedButton === "=" && isNaN(expression[expression.length - 1])) {
    return expression;
  }
  console.log(selectedButton);

  if (
    selectedButton === "+" ||
    selectedButton === "-" ||
    selectedButton === "*" ||
    selectedButton === "%" ||
    selectedButton === "/"
  ) {
    return eval(expression) + selectedButton;
  }

  if (selectedButton === "=") {
    return eval(expression);
  }

  return (expression += selectedButton);
};
