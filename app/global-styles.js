import { injectGlobal } from 'styled-components'

/* eslint no-unused-expressions: 0 */
injectGlobal`
  html {
    height: 100%;
    width: 100%;
  }

  #app {
    background-color: #fafafa;
    max-height: 100%; 
    max-width: 100%;
  }

  body {
    width: calc(100% + 10px);
    height: 100%;
    font-family: 'Open Sans', sans-serif; 
    font-size: 14.5px; 
    margin: 0; 
    -webkit-tap-highlight-color: rgba(0,0,0,0);
    -webkit-text-size-adjust: 100%; 
    font-weight: 300; 
    position: relative;
    overflow-x: hidden;
    overflow-y: overlay;

    &::-webkit-scrollbar {
      width: 10px;
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(200, 200, 200, 0.7) !important;
    }
  }

  @media (max-width: 767px) {
    body {
      width: 100%;

      &::-webkit-scrollbar {
        display: none;
      }
    }
  }

  * {
    font-family: 'Open Sans', sans-serif !important;
    margin:0; 
    padding:0; 
    -webkit-font-smoothing: auto !important;
    -khtml-user-select: none;
    -o-user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    user-select: none;
  }

  @media screen and (orientation:portrait) {
    body { font-size: calc(12px + 0.4vh) }
  }

  button {
    text-transform: uppercase;
    font-size: 13px;
    cursor: pointer;
    border-radius: 0;
    color: rgba(0, 0, 0, 0.7);

    &:hover { color: rgba(0, 0, 0, 1) }
  }

  button:focus, input:focus { outline: none }

  .hidden {
    display: none !important;
    margin-top: 0;
    margin-bottom: 0;
    padding-top: 0;
    padding-botttom: 0;
  }

  .show { display: block !important }

  .invisible {
    visibility: hidden;
    width: 0;
    opacity: 0;
    left: 0;
  }

  textarea, input {
    -khtml-user-select: text;
    -o-user-select: text;
    -moz-user-select: text;
    -webkit-user-select: text;
    user-select: text;
  }
`
