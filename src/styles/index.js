import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
    :root {
      --background: ${({ theme }) =>
        theme === "cream"
          ? "#d7d7be"
          : theme === "dark"
          ? "#222222"
          : "#ffffff"};
      --highlight: ${({ theme }) =>
        theme === "cream"
          ? "#000000"
          : theme === "dark"
          ? "#ffffff"
          : "#ab2a2c"};
    }
  
    * {
      margin:0;
      padding:0;
      box-sizing: border-box;
    }
  
    *,
    *:before,
    *:after {
      box-sizing: inherit;
    }
  
    @keyframes startanim {
    0% {
      transform: translate(-101%, 0);
    }
    100% {
      transform: translate(0, 0);
    }
  }
  `;

export default GlobalStyles;
