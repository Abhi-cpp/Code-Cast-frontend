import React from "react";
import { useEffect } from "react";

const Loader = () => {
  useEffect(() => {
    const loaderImg = document.querySelector(
      "#loader #loader-front-img",
    ) as HTMLImageElement;
    const loaderImgLight = document.querySelector(
      "#loader #loader-front-img-light",
    ) as HTMLImageElement;
    const loaderBackImg = document.querySelector(
      "#loader #loader-back-img",
    ) as HTMLImageElement;
    const loaderBackImgLight = document.querySelector(
      "#loader #loader-back-img-light",
    ) as HTMLImageElement;
    if (document.querySelector("#root")?.classList.contains("dark")) {
      loaderImg.style.width = loaderBackImg?.offsetWidth + "px";
      loaderImgLight.style.width = loaderBackImg?.offsetWidth + "px";
    } else {
      loaderImg.style.width = loaderBackImgLight?.offsetWidth + "px";
      loaderImgLight.style.width = loaderBackImgLight?.offsetWidth + "px";
    }
  }, []);
  return (
    <div id="loader">
      <img
        src="/app-logo.png"
        id="loader-back-img"
        alt="black and white "
      ></img>
      <img
        src="/app-logo-light.png"
        id="loader-back-img-light"
        alt="black and white "
      ></img>
      <div id="loader-front-image-container">
        <img src="/app-logo.png" id="loader-front-img" alt="colorful"></img>
        <img
          src="/app-logo-light.png"
          id="loader-front-img-light"
          alt="black and white "
        ></img>
      </div>
    </div>
  );
};

export default Loader;
